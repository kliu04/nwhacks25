from flask import Flask, request, jsonify
import os 

app = Flask(__name__)
@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/upload', methods=['POST'])
def upload_image():
    """Handle image uploads."""
    # Check if the request contains a file
    if 'image' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['image']

    # Check if the user uploaded a file
    if file.filename == '':
        return jsonify({'error': 'No file selected for upload'}), 400


    # Secure the filename and save the file
    filename = file.filename
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    return jsonify({
        'message': 'Image uploaded successfully',
        'filename': filename,
        'filepath': filepath
    }), 200