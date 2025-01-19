import React from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignIn.css"; // Import the updated CSS

interface DecodedToken {
    name: string;
    email: string;
    sub: string; // Unique user identifier
}

const SignIn: React.FC = () => {
    const clientId = "531282944371-bfmopt7kqn3i3n5lboqun1ktmc10kj8b.apps.googleusercontent.com";
    const navigate = useNavigate();

    const handleSuccess = async (response: CredentialResponse) => {
        if (response.credential) {
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
                console.error("Error registering user:", error);

                alert("Failed to register user in the database. Please try again.");
            }

            // Redirect the user to the next page
            navigate("/getstarted");
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
        localStorage.removeItem("userId"); // Remove the user identifier from local storage
        alert("You have logged out.");
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="sign-in">
                <h1 className="sign-in__title">Sign In</h1>
                <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
                <button className="sign-in__logout-button" onClick={handleLogout}>
                    Logout
                </button>
                <Link to="/getstarted" className="sign-in__continue-link">
                    Continue
                </Link>
            </div>
        </GoogleOAuthProvider>
    );
};

export default SignIn;
