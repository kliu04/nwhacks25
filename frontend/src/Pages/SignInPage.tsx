import React from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";

const SignInPage: React.FC = () => {
    const clientId = "531282944371-bfmopt7kqn3i3n5lboqun1ktmc10kj8b.apps.googleusercontent.com";

    // Handle successful login
    const handleSuccess = (response: any) => {
        const decodedToken: any = jwtDecode(response.credential);
        console.log("User Info:", decodedToken);
        alert(`Welcome, ${decodedToken.name}`);
    };

    // Handle login error
    const handleError = () => {
        console.error("Login Failed");
        alert("Google Sign-In failed. Please try again.");
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="sign-in">
                <h1 className="sign-in__title">Sign In</h1>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
                <button
                    className="sign-in__logout-button"
                    onClick={() => {
                        googleLogout();
                        alert("You have logged out.");
                    }}
                >
                    Logout
                </button>
            </div>
        </GoogleOAuthProvider>
    );
};

export default SignInPage;
