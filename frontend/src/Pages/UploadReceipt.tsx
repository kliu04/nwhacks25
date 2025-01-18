import React, { useState } from "react";

const UploadReceipt: React.FC = () => {
    const [base64String, setBase64String] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const reader = new FileReader();

            // Handle successful Base64 conversion
            reader.onload = () => {
                const base64 = reader.result as string;
                setBase64String(base64);
                setErrorMessage(null);
            };

            // Handle file read errors
            reader.onerror = () => {
                setErrorMessage("Failed to read file. Please try again.");
                setBase64String(null);
            };

            reader.readAsDataURL(file); // Convert file to Base64
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

            {base64String && (
                <div className="upload-receipt__preview">
                    <h3>Image Preview:</h3>
                    <img src={base64String} alt="Uploaded Receipt" className="upload-receipt__image" />
                </div>
            )}
        </div>
    );
};

export default UploadReceipt;
