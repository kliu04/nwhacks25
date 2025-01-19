from openai import OpenAI
from flask import Flask, request, jsonify
from datetime import datetime
import sqlite3


app = Flask(__name__)
client = OpenAI()

# stub
current_user_id = 1

# stub
current_user_id = 1


@app.route("/upload", methods=["POST"])
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


def generate_recipes(current_user):
    data = [
        ("Zucchini Green", "2023-11-08", 5, None),
        ("Banana Cavendish", "2023-11-03", 7, None),
        ("Potatoes Brushed", "2023-11-11", None, 1.328),
        ("Broccoli", "2023-11-06", 3, None),
    ]
    # need to sort the array in order of increasing expiry date
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": "You are a helpful assistant."},
            {
                "role": "user",
                "content": f"""
                    Generate recipes based on these ingredients: {data}, 
                    prioritizing using those with the soonest expiry time, and with as few
                    ingredients that are not in the list as possible.""",
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


if __name__ == "__main__":
    generate_recipes(1)
    # app.run(debug=True, port=5000)


def get_all_items():
    # SQLite connection (provide the path to your SQLite database file)
    connection = sqlite3.connect("database.db")
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

    print(items)
    return items  # Return the fetched items
