import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./UploadReceipt.css"; // Import the updated CSS

const UploadReceipt: React.FC = () => {
    const [base64String, setBase64String] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Handle file selection and convert to Base64
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = () => {
                const base64 = reader.result as string;
                setBase64String(base64);
                setErrorMessage(null);
                setSuccessMessage(null);
            };

            reader.onerror = () => {
                setErrorMessage("Failed to read file. Please try again.");
                setBase64String(null);
                setSuccessMessage(null);
            };

            reader.readAsDataURL(file);
        }
    };

    // Clear the form and reset state
    const handleClear = () => {
        setBase64String(null);
        setErrorMessage(null);
        setSuccessMessage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Upload the current image to the backend
    const handleUpload = async () => {
        if (!base64String) {
            setErrorMessage("No image selected to upload.");
            return;
        }

        const userID = localStorage.getItem("userId");
        if (!userID) {
            setErrorMessage("User is not logged in. Please log in first.");
            navigate("/");
            return;
        }

        setIsUploading(true);

        try {
            const data = new FormData();
            data.append("image", base64String);

            const config = {
                method: "post",
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                url: `https://nwhacks25.onrender.com/receipt`,
                params: { user_ID: userID },
                data: data,
            };

            const response = await axios.request(config);
            console.log("Upload Response:", response.data);

            setSuccessMessage("Receipt uploaded successfully!");
            setErrorMessage(null);
        } catch (error) {
            // Show unified user-facing message
            setErrorMessage("You have already uploaded this receipt.");
            setSuccessMessage(null);

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 400) {
                    // 400 Error: Already uploaded receipt
                    handleClear(); // Clear the form without navigating
                } else {
                    // Other errors: Show message and navigate home
                    navigate("/");
                }
            } else {
                // Non-Axios errors: Show message and navigate home
                navigate("/");
            }
        } finally {
            setIsUploading(false);
        }
    };

    // "Next" always navigates to home
    const handleNext = () => {
        navigate("/");
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
                id="file-input"
                disabled={isUploading}
                ref={fileInputRef}
            />

            {errorMessage && <p className="upload-receipt__error">{errorMessage}</p>}
            {successMessage && <p className="upload-receipt__success">{successMessage}</p>}

            {base64String && (
                <div className="upload-receipt__preview">
                    <h3>Image Preview:</h3>
                    <img src={base64String} alt="Uploaded Receipt" className="upload-receipt__image" />
                </div>
            )}

            <div className="upload-receipt__buttons">
                {/* Clear (doesn't post; removes image) */}
                <button
                    onClick={handleClear}
                    className="upload-receipt__clear-button"
                    disabled={isUploading || !base64String}
                >
                    Clear
                </button>

                {/* Upload (posts to backend) */}
                <button
                    onClick={handleUpload}
                    className="upload-receipt__upload-button"
                    disabled={isUploading || !base64String}
                >
                    {isUploading ? "Uploading..." : "Upload"}
                </button>

                {/* Next (always navigates to home) */}
                <button
                    onClick={handleNext}
                    className="upload-receipt__next-button"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default UploadReceipt;
