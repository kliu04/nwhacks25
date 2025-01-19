from openai import OpenAI
from flask import Flask, request, jsonify
from datetime import datetime
from flask_cors import CORS
import sqlite3
import os
import json

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"origins": ["https://nwhacks25.vercel.app/"]}})
client = OpenAI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")


@app.route("/inventory", methods=["GET", "POST"])
def get_inventory():
    if request.method == "GET":
        try:
            user_ID = request.args.get("user_ID")
            items = get_all_items(user_ID)
            return (jsonify(items), 200)
        except Exception as e:
            return (jsonify({"error": "Cannot get inventory"}), 400)
    # POST
    try:
        user_ID = request.args.get("user_ID")
        parsed_data = json.loads(request.args.get("items"))

        for item in parsed_data:
            item["expiry-date"] = item.pop("expiry")
        clear_user_data(user_ID)
        insert_data(parsed_data, user_ID)
        return (jsonify({"message": "Items set successfully"}), 200)
    except Exception as e:
        return (jsonify({"error:" "Cannot set inventory"}), 400)


@app.route("/receipt", methods=["POST"])
def upload_receipt():
    user_ID = request.args.get("user_ID")
    data = request.form.get("image")

    if not data or "image" not in data:
        return (jsonify({"error": "No image data found"}), 400)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_ID,))
    existing_user = cursor.fetchone()

    if not existing_user:
        cursor.close()
        conn.close()
        return (
            jsonify({"error": f"User {user_ID} does not exist."}),
            400,
        )

    cursor.close()
    conn.close()

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
                        The current date is: {datetime.today().strftime('%Y-%m-%d')}.
                        Please spell check and expand abbreviations, for example klggs cere is kellogs cereal. Receipts will shorten
                        names so please expand them. Ignore non-food items.
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
        # hacky
        insert_data(json.loads(response.choices[0].message.content)["items"], user_ID)
        return (
            jsonify({"message": "Image uploaded successfully"}),
            200,
        )

    except Exception as e:
        return (jsonify({"error": f"Failed to process image: {str(e)}"}), 500)


def clear_user_data(user_ID):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    query = """DELETE FROM items WHERE user_ID = ?"""
    cursor.execute(query, (user_ID,))

    connection.commit()
    cursor.close()
    connection.close()


def insert_data(receipt, user_ID):
    # Establish connection to SQLite database
    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()

    user_id = user_ID

    for item in receipt:
        # Data to insert
        item_name = item["name"]
        expiry_date_str = item[
            "expiry-date"
        ]  # Use actual expiry_date from the item if available
        expiry_date = None
        try:
            expiry_date = datetime.strptime(expiry_date_str, "%Y%m%d").date()
        except:
            expiry_date = datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
        quantity = None
        weight = None

        # Check if amount contains "kg"
        if "kg" in str(item["amount"]):  # Assuming 'amount' is a string in the item
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


def get_all_items(user_ID):

    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()

    # Corrected SQL Query
    select_query = """
        SELECT name, expiry_date, quantity, weight 
        FROM items 
        WHERE user_id = ?
    """
    data = (user_ID,)

    cursor.execute(select_query, data)

    # Fetch all the results
    items = cursor.fetchall()

    # Close connection
    cursor.close()
    connection.close()

    return items  # Return the fetched items


@app.route("/generate_recipes", methods=["GET"])
def generate_recipes():
    user_ID = request.args.get("user_ID")
    data = get_all_items(user_ID)
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
    return jsonify(response.choices[0].message.content), 200


# get recipes, inventory, set inventory


@app.route("/register", methods=["POST"])
def register_user():
    user_ID = request.args.get("user_ID")
    # Connect to SQLite database (or create if it doesn't exist)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # Check if the user already exists
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_ID,))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            conn.close()
            return (
                jsonify({"error": f"User {user_ID} already exists."}),
                400,
            )

        else:
            # Insert the new user into the database
            cursor.execute("INSERT INTO users (user_id) VALUES (?)", (user_ID,))
            conn.commit()
            cursor.close()
            conn.close()
            return (
                jsonify(
                    {"message": f"User {user_ID} has been successfully registered."}
                ),
                200,
            )
    except:
        cursor.close()
        conn.close()
        return (
            jsonify({"error": f"Cannot register user."}),
            500,
        )

    # Close the connection


# takes list of ingredients
def generate_subtractions(recipe):
    # ingredients_raw = recipe["ingredients"]
    ingredients_raw = recipe
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": "You are a helpful assistant."},
            {
                "role": "user",
                "content": f"""
                    Generate a list of tuples based on these ingredients: {ingredients_raw}.
                    Each tuple consists of two elements: the ingredient name as a string and the ingredient amount as a number (can be with decimals).
                """,
            },
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "ingredient_tuples",
                "schema": {
                    "type": "object",
                    "properties": {
                        "ingredient_tuples": {
                            "type": "array",  # Use an array of objects
                            "description": "List of ingredient tuples.",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "description": "The name of the ingredient.",
                                    },
                                    "amount": {
                                        "type": "number",
                                        "description": "The amount of the ingredient.",
                                    },
                                },
                                "required": ["name", "amount"],
                                "additionalProperties": False,
                            },
                        }
                    },
                    "required": ["ingredient_tuples"],
                    "additionalProperties": False,
                },
            },
        },
    )

    return response.choices[0].message.content


# takes list of ingredients
@app.route("/subtract", methods=["POST"])
def subtract_quantities():
    userid = request.args.get("user_ID")
    recipe = json.loads(request.args.get("ingredients"))
    print(recipe)

    to_updates = json.loads(generate_subtractions(recipe))
    to_updates = to_updates["ingredient_tuples"]

    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()

    # Fetch all item names for the user
    select_query = """
        SELECT name
        FROM items 
        WHERE user_id = ?
    """
    data = (userid,)
    cursor.execute(select_query, data)
    items = cursor.fetchall()

    for update in to_updates:
        quant = True
        if update["name"] in [item[0] for item in items]:
            # Fetch all item names for the user
            select_quant_query = """
                SELECT quantity
                FROM items 
                WHERE user_id = ? AND name = ?
            """
            data = (
                userid,
                update["name"],
            )
            cursor.execute(select_quant_query, data)
            quant_result = cursor.fetchall()
            if quant_result[0][0] is None:
                quant = False
                select_weight_query = """
                    SELECT weight
                    FROM items 
                    WHERE user_id = ? AND name = ?
                """
                data = (
                    userid,
                    update["name"],
                )
                cursor.execute(select_weight_query, data)
                weight_result = cursor.fetchall()
            if quant:
                new_amount = quant_result[0][0] - update["amount"]
                update_query = """
                    UPDATE items
                    SET quantity = ?
                    WHERE user_id = ? AND name = ?
                """

            else:
                new_amount = weight_result[0][0] - update["amount"]
                update_query = """
                    UPDATE items
                    SET weight = ?
                    WHERE user_id = ? AND name = ?
                """

            data = (
                new_amount,
                userid,
                update["name"],
            )
            cursor.execute(update_query, data)

            # remove the amount if it's amount <= 0
            if new_amount <= 0:
                # new_amount = 0
                delete_query = """
                    DELETE FROM items
                    WHERE user_id = ? AND name = ?
                """
                data = (
                    userid,
                    update["name"],
                )
                cursor.execute(delete_query, data)

            connection.commit()

    # Close connection
    cursor.close()
    connection.close()

    return (
        jsonify({"message": f"Deleted ingredients from recipe."}),
        200,
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
