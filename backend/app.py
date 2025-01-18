import os
import base64
from openai import OpenAI
from flask import Flask, request, jsonify

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
