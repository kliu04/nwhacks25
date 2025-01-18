import React from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout, CredentialResponse } from "@react-oauth/google";
import  jwtDecode  from "jwt-decode";

const styles = {
    container: {
        textAlign: "center" as "center",
        marginTop: "10%",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        maxWidth: "400px",
        margin: "auto",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    logoutButton: {
        marginTop: "20px",
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "5px",
        cursor: "pointer",
        border: "1px solid #d3d3d3",
        backgroundColor: "#ff4b4b",
        color: "white",
    },
};

interface DecodedToken {
    name: string;
    email: string;
}

interface DecodedToken {
    name: string;
    email: string;
    sub: string;
}

const SignInPage: React.FC = () => {
    const clientId = "531282944371-bfmopt7kqn3i3n5lboqun1ktmc10kj8b.apps.googleusercontent.com";

    // Handle successful login
    const handleSuccess = (response: any) => {
        const decodedToken: any = jwtDecode(response.credential);
        console.log("User Info:", decodedToken);
        alert(`Welcome, ${decodedToken.name}`);
    };

    const handleError = () => {
        console.error("Login Failed");
        alert("Google Sign-In failed. Please try again.");
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div style={styles.container}>
                <h1>Google Sign-In Example</h1>
                <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
                <button
                    style={styles.logoutButton}
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

export default SignIn;
