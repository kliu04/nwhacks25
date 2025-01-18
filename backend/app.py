import os
import base64
from openai import OpenAI
from flask import Flask, request, jsonify
from datetime import datetime


import mysql.connector


app = Flask(__name__)

# Configure the upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Create the folder if it doesn't exist
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/upload', methods=['POST'])
def upload_base64_image():
    """Handle image uploads via Base64 encoding."""
    # Get the data from the request
    data = request.form.get('image')

    if not data or 'image' not in data:
        return jsonify({'error': 'No image data found'}), 400
    
    # base64 encoded string is data

    try:
        # Extract Base64 string and decode it
        data = data.split("base64,")[1]
        image_data = base64.b64decode(data)

        # Generate a unique filename
        filename = "test"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{filename}.png")

        # Save the image to the server
        with open(filepath, 'wb') as file:
            file.write(image_data)

        return jsonify({'message': 'Image uploaded successfully', 'filepath': filepath}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)




        



def insert_data(receipt, current_user):
    # Establish connection
    connection = mysql.connector.connect(
        host='127.0.0.1',  # Use localhost or your database IP
        database='database'
        # user='your_username',  # Add your MySQL username
        # password='your_password'  # Add your MySQL password
    )
    cursor = connection.cursor()

    user_id = current_user.id

    receipt = receipt['items']

    for item in receipt:
        # Data to insert
        item_name = item['name']  # Assuming item name comes from the receipt
        # ToDo: done
        expiry_date_str = item['expiry_date']  # Use actual expiry_date from the item if available
        expiry_date = datetime.strptime(expiry_date_str, "%Y%m%d").date()
        quantity = None
        weight = None

        # Check if amount contains "kg"
        if "kg" in item['amount']:  # Assuming 'amount' is a string in the item
            weight = float(item['amount'].replace("kg", "").strip())
        else:
            quantity = int(float(item['amount']))  # Ensure it converts properly
            

        # Insert query
        insert_query = """
        INSERT INTO items (user_id, name, expiry_date, quantity, weight)
        VALUES (%s, %s, %s, %s, %s)
        """
        data = (user_id, item_name, expiry_date, quantity, weight)

        # Execute query and commit
        cursor.execute(insert_query, data)

    # Commit once after the loop to avoid multiple commits
    connection.commit()

    # Close connection
    cursor.close()
    connection.close()



