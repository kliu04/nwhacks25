import React from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./SignIn.css"; // Import the updated CSS

interface DecodedToken {
    name: string;
    email: string;
    sub: string;
}

const SignIn: React.FC = () => {
    const clientId = "531282944371-bfmopt7kqn3i3n5lboqun1ktmc10kj8b.apps.googleusercontent.com";

    const handleSuccess = async (response: CredentialResponse) => {
        if (response.credential) {
            try {
                // Decode the JWT credential
                const decodedToken: DecodedToken = jwtDecode<DecodedToken>(response.credential);
                console.log("User Info:", decodedToken);

                // Save the user identifier (sub) in local storage
                localStorage.setItem("userId", decodedToken.sub);
                alert(`Welcome, ${decodedToken.name}`);

                // Register the user in the database using query parameters
                try {
                    await axios.post(
                        "https://nwhacks25.onrender.com/register",
                        null, // Empty body
                        {
                            params: {
                                user_ID: decodedToken.sub, // Send user_ID as a query parameter
                            },
                        }
                    );
                    console.log("User registered successfully.");
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        const axiosError = error as AxiosError;

                        if (axiosError.response) {
                            if (axiosError.response.status === 400) {
                                // 400 Error: User is already signed in
                                alert("You are already signed in.");
                            } else {
                                // Other HTTP errors
                                console.error("Error registering user:", axiosError.response.data);
                                alert("Failed to register user in the database. Please try again.");
                            }
                        } else {
                            // No response received (network error, etc.)
                            console.error("Error registering user:", axiosError.message);
                            alert("Network error: Failed to register user. Please try again.");
                        }
                    } else {
                        // Non-Axios errors
                        console.error("Unexpected error registering user:", error);
                        alert("An unexpected error occurred. Please try again.");
                    }
                }

                // Redirect the user to the next page
            } catch (decodeError) {
                console.error("Error decoding token:", decodeError);
                alert("Failed to decode authentication token. Please try again.");
            }
        } else {
            console.error("Credential is undefined.");
            alert("Google Sign-In failed. Please try again.");
        }
    };

    const handleError = () => {
        console.error("Login Failed");
        alert("Google Sign-In failed. Please try again.");
    };

    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("userId");
        alert("You have logged out.");
    };

    return (
      <div className="sign-in__buttons">
        <GoogleOAuthProvider clientId={clientId}>
            <div className="sign-in">
                <h1 className="sign-in__title">Sign In</h1>
                <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
                <button className="sign-in__button" onClick={handleLogout}>
                    Logout
                </button>
                <Link to="/" className="sign-in__button">
                    Continue
                </Link>
            </div>
        </GoogleOAuthProvider>
      </div>
    );
};

export default SignIn;
