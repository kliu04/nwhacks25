from openai import OpenAI
from flask import Flask, request, jsonify
from datetime import datetime
import sqlite3
import os

app = Flask(__name__)
client = OpenAI()


# stub
current_user_id = 1


@app.route("/receipt", methods=["POST"])
def upload_base64_image():
    data = request.form.get("image")

    if not data or "image" not in data:
        return jsonify({"error": "No image data found"}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """You are a helpful assistant that does OCR on receipts (base64 encoded) 
                    to parse the name of food items, quantity of food, and predicted expiry date of each item.""",
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"""
                        create an array of json objects from the receipt data, 
                        each object has exactly a name (string), 
                        amount (string) -- which is either the quantity or its weight (must be in kg),
                        and an expiry date (string), which you must generate from context (what the item is)
                        as an offset of the current date,
                        Strip out all new lines and spaces. Ignore any extra information in the receipt such as prices.
                        The current date is: {datetime.today().strftime('%Y-%m-%d')}
                        """,
                        },
                        {"type": "image_url", "image_url": {"url": data}},
                    ],
                },
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "inventory",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string",
                                            "description": "The name of the item.",
                                        },
                                        "amount": {
                                            "type": "string",
                                            "description": "The quantity of the item (as a number) or weight in kilograms.",
                                        },
                                        "expiry-date": {
                                            "type": "string",
                                            "description": "The expiry date of the item in YYYYMMDD format.",
                                        },
                                    },
                                    "required": ["name", "amount", "expiry-date"],
                                    "additionalProperties": False,
                                },
                            },
                        },
                        "required": ["items"],
                        "additionalProperties": False,
                    },
                    "strict": True,
                },
            },
        )
        print(response.choices[0].message.content)
        return (
            jsonify({"message": "Image uploaded successfully"}),
            200,
        )

    except Exception as e:
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500


def insert_data(receipt, current_user):
    # Establish connection to SQLite database
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()

    user_id = current_user_id

    receipt = receipt["items"]

    for item in receipt:
        # Data to insert
        item_name = item["name"]  # Assuming item name comes from the receipt
        # ToDo: done
        expiry_date_str = item[
            "expiry_date"
        ]  # Use actual expiry_date from the item if available
        expiry_date = datetime.strptime(expiry_date_str, "%Y%m%d").date()
        quantity = None
        weight = None

        # Check if amount contains "kg"
        if "kg" in item["amount"]:  # Assuming 'amount' is a string in the item
            weight = float(item["amount"].replace("kg", "").strip())
        else:
            quantity = int(float(item["amount"]))  # Ensure it converts properly

        # Insert query
        insert_query = """
        INSERT INTO items (user_id, name, expiry_date, quantity, weight)
        VALUES (?, ?, ?, ?, ?)
        """
        data = (user_id, item_name, expiry_date, quantity, weight)

        # Execute query and commit
        cursor.execute(insert_query, data)

    # Commit once after the loop to avoid multiple commits
    connection.commit()

    # Close connection
    cursor.close()
    connection.close()


def get_all_items(current_user):
    ## path issue
    # SQLite connection (provide the path to your SQLite database file)

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(BASE_DIR, "database.db")

    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()

    # Assuming current_user.id is available
    userid = current_user_id

    # Corrected SQL Query
    select_query = """
        SELECT name, expiry_date, quantity, weight 
        FROM items 
        WHERE user_id = ?
    """
    data = (userid,)

    cursor.execute(select_query, data)

    # Fetch all the results
    items = cursor.fetchall()

    # Close connection
    cursor.close()
    connection.close()

    return items  # Return the fetched items


@app.route("/generate_recipes", methods=["GET"])
def generate_recipes(current_user):
    data = get_all_items(current_user)
    print(data)
    # [(name, amount)]
    # need to sort the array in order of increasing expiry date
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": "You are a helpful assistant."},
            {
                "role": "user",
                "content": f"""
                    Generate recipes based on these ingredients: {data}, 
                    prioritizing using those with the earliest expiry time (2nd index), and with as few
                    ingredients that are not in the list as possible. Use exactly the wording we have in the array, 
                    and do not use more than what is given (either weight which is the last index or quantity which is the
                    3rd index). Input the exact number of ingredients used or weight if applicable in kg.""",
            },
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "recipes",
                "schema": {
                    "type": "object",
                    "properties": {
                        "recipes": {
                            "type": "array",
                            "description": "List of recipes.",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "description": "The name of the dish.",
                                    },
                                    "ingredients": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "The list of ingredients for the dish.",
                                    },
                                    "steps": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "The list of steps for the dish.",
                                    },
                                    "requiresExtra": {
                                        "type": "boolean",
                                        "description": "If more ingredients than provided are needed for the recipe.",
                                    },
                                },
                                "required": [
                                    "name",
                                    "ingredients",
                                    "steps",
                                    "requiresExtra",
                                ],
                                "additionalProperties": False,
                            },
                        }
                    },
                    "required": ["recipes"],
                    "additionalProperties": False,
                },
                "strict": True,
            },
        },
    )
    print(response.choices[0].message.content)


# get recipes, inventory, set inventory
if __name__ == "__main__":
    generate_recipes(1)
    # app.run(debug=True, port=5000)
