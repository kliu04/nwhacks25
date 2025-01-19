from openai import OpenAI
from flask import Flask, request, jsonify
from datetime import datetime
import sqlite3
import os
import json 
from fractions import Fraction

app = Flask(__name__)
client = OpenAI()


# stub
current_user_id = 1


@app.route("/inventory", methods=["GET", "POST"])
def get_inventory():
    if request.method == "GET":
        try:
            current_user = request.args.get("user_ID")
            items = get_all_items(current_user)
            return jsonify(items), 200
        except Exception as e:
            return ({"error": "Cannot get inventory"}), 400
    # POST
    try:
        current_user = request.args.get("user_ID")
        items = request.args.get("items")
        insert_data(items, current_user)
        return ({"message": "Items set successfully"}), 200
    except Exception as e:
        return ({"error:" "Cannot set inventory"}), 400


@app.route("/receipt", methods=["POST"])
def upload_receipt():
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

        insert_data(response.choices[0].message.content["items"], 1)
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

    user_id = current_user

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
    userid = current_user

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


# def make_recipe_map(recipe):
#     connection = sqlite3.connect("database.db")
#     cursor = connection.cursor()

#     # Assuming current_user_id is available
#     userid = current_user_id

#     # Fetch all item names for the user
#     select_query = """
#         SELECT name
#         FROM items 
#         WHERE user_id = ?
#     """
#     data = (userid,)
#     cursor.execute(select_query, data)
#     items = [row[0].lower() for row in cursor.fetchall()]  # Fetch item names and convert to lowercase

#     ingredients_raw = recipe["ingredients"]
#     ingredient_map = {}

#     for item in ingredients_raw:
#         # Split the quantity and ingredient name
#         parts = item.split(" ", 1)
#         if len(parts) == 2:
#             quantity_str, ingredient_name = parts
#             # Normalize ingredient name for matching
#             ingredient_name = ingredient_name.split(",")[0].lower().strip()
            
#             # Find the closest match for the ingredient name in the database
#             matched_item = None
#             for db_item in items:
#                 if ingredient_name in db_item:  # Check if the ingredient name is part of the database item
#                     matched_item = db_item
#                     break

#             if matched_item:
#                 # Convert the quantity to a float
#                 try:
#                     quantity = float(Fraction(quantity_str))  # Convert fractions to decimal
#                 except ValueError:
#                     quantity = None  # Handle cases where the quantity isn't valid
#                 ingredient_map[matched_item] = quantity

#     # Close connection
#     cursor.close()
#     connection.close()

#     return ingredient_map



def generate_subtractions(recipe):
    ingredients_raw = recipe["ingredients"]
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
                                        "description": "The name of the ingredient."
                                    },
                                    "amount": {
                                        "type": "number",
                                        "description": "The amount of the ingredient."
                                    }
                                },
                                "required": ["name", "amount"],
                                "additionalProperties": False
                            }
                        }
                    },
                    "required": ["ingredient_tuples"],
                    "additionalProperties": False
                }
            }
        },
    )

    # print(response.choices[0].message.content)


    return response.choices[0].message.content


def subtract_quantities(recipe):
    to_updates = json.loads(generate_subtractions(recipe))
    #print(to_updates)
    to_updates = to_updates["ingredient_tuples"]

    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()

    # Assuming current_user_id is available
    userid = current_user_id

    # Fetch all item names for the user
    select_query = """
        SELECT name
        FROM items 
        WHERE user_id = ?
    """
    data = (userid,)
    cursor.execute(select_query, data)
    items = cursor.fetchall()

    #print(items)
    for update in to_updates:
        quant = True
        if update['name'] in [item[0] for item in items]:
             # Fetch all item names for the user
            select_quant_query = """
                SELECT quantity
                FROM items 
                WHERE user_id = ? AND name = ?
            """
            data = (userid,update['name'], )
            cursor.execute(select_quant_query, data)
            quant_result = cursor.fetchall()
            if quant_result[0][0] is None:
                quant = False
                select_weight_query = """
                    SELECT weight
                    FROM items 
                    WHERE user_id = ? AND name = ?
                """
                data = (userid,update['name'], )
                cursor.execute(select_weight_query, data)
                weight_result = cursor.fetchall()
            if quant:
                new_amount = quant_result[0][0] - update['amount']
                update_query =  """
                    UPDATE items
                    SET quantity = ?
                    WHERE user_id = ? AND name = ?
                """

            else:
                new_amount = weight_result[0][0] - update['amount']
                update_query =  """
                    UPDATE items
                    SET weight = ?
                    WHERE user_id = ? AND name = ?
                """
            
            if new_amount < 0:
                new_amount = 0
            print(update['name'])
            print(new_amount)

            data = (new_amount, userid,update['name'], )
            cursor.execute(update_query, data)
            connection.commit()

    # Close connection
    cursor.close()
    connection.close()


recipe = {
    "name": "Zucchini Banana Smoothie",
    "ingredients": [
        "Zucchini Green (0.778 kg)",
        "Broccoli (0.808 kg)",
        "Banana Cavendish (2 units)",
        "1 tbsp honey",
        "1/2 cup ice cubes"
    ],
    "steps": [
        "Combine the banana, zucchini, milk, honey, and ice cubes in a blender.",
        "Blend until smooth.",
        "Pour into a glass and serve immediately."
    ],
    "requiresExtra": True
}



subtract_quantities(recipe)

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

   
    return items  # Return the fetched items



def register_login_user(userID):
    # Connect to SQLite database (or create if it doesn't exist)
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Check if the user already exists
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (userID,))
    existing_user = cursor.fetchone()
 
    if existing_user:
        print(f"User with id {userID} already exists.")
    else:
        # Insert the new user into the database
        cursor.execute('INSERT INTO users (user_id) VALUES (?)', (userID,))
        
        conn.commit()
        print(f"User with id {userID} has been successfully registered.")

    # Close the connection
    cursor.close()
    conn.close()

#test
#register_login_user('31415926')
 


