import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import FormData from "form-data";

const UploadReceipt: React.FC = () => {
    const [base64String, setBase64String] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const reader = new FileReader();

            // Handle successful Base64 conversion
            reader.onload = () => {
                const base64 = reader.result as string;
                setBase64String(base64);
                setErrorMessage(null);
                setSuccessMessage(null);
            };

            // Handle file read errors
            reader.onerror = () => {
                setErrorMessage("Failed to read file. Please try again.");
                setBase64String(null);
                setSuccessMessage(null);
            };

            reader.readAsDataURL(file); // Convert file to Base64
        }
    };

    const handleSubmit = async () => {
        if (!base64String) {
            setErrorMessage("No image selected to upload.");
            return;
        }

        // Retrieve userID from local storage
        const userID = localStorage.getItem("userId");
        if (!userID) {
            setErrorMessage("User is not logged in. Please log in first.");
            return;
        }

        try {
            // Create FormData and append the Base64 string
            const data = new FormData();
            data.append("image", base64String);

            // Configure the Axios request
            const config = {
                method: "post",
                maxBodyLength: Infinity,
                url: `https://nwhacks25.onrender.com/receipt?user_ID=${userID}`,
                headers: {
                },
                data: data,
            };

            axios.request(config)
                .then(res => {console.log(JSON.stringify(res.data));})
                .catch(err => {console.log(err)});
            setSuccessMessage("Receipt uploaded successfully!");
            setErrorMessage(null);
        } catch (error) {
            // Handle error response
            console.error("Error uploading receipt:", error);

            setErrorMessage("Failed to upload receipt. Please try again.");
            setSuccessMessage(null);
        }
    };

    return (
        <div className="upload-receipt">
            <h1 className="upload-receipt__title">Upload Receipt</h1>
            <p className="upload-receipt__subtitle">Select a grocery receipt image to upload:</p>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="upload-receipt__file-input"
            />

            {errorMessage && <p className="upload-receipt__error">{errorMessage}</p>}
            {successMessage && <p className="upload-receipt__success">{successMessage}</p>}

            {base64String && (
                <div className="upload-receipt__preview">
                    <h3>Image Preview:</h3>
                    <img src={base64String} alt="Uploaded Receipt" className="upload-receipt__image" />
                </div>
            )}

            <button onClick={handleSubmit} className="upload-receipt__submit-button">
                Upload
            </button>

            <Link to="/confirmation" className="upload-receipt__next-link">
                Next
            </Link>
        </div>
    );
};

export default UploadReceipt;
