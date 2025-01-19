import { Link } from "react-router-dom";
import "./Home.css"; // Import the updated CSS

import closeupImage from "../assets/images/close-up-hand-written.jpg";
import uploadImage from "../assets/images/tild3665-3064-4562-b238-353665643236__-__resize__504x__cropped-image-man-ho.jpg";
import recipesIcon from "../assets/images/tild6263-3062-4666-b831-353366356234__food-ingredients-mak.jpg";

function Home() {
    return (
        <div className="home">
            {/* Header Section with Sign In */}
            <header className="header">
                <div className="header__logo">
                    <h1>Pantry Pal</h1>
                </div>
                <div className="header__sign-in">
                <Link to="/signin" className="nav-link">
                        Sign In
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <h1>Stop throwing away food. Save money. Discover new recipes</h1>
                <p>
                    Upload your receipts and let us track your food's expiry dates. 
                    We'll suggest recipes based on your inventory, helping you reduce waste and save money.
                </p>
            </section>

            {/* Navigation Links */}
            <section className="navigation">
                <nav className="nav-links">
                    <Link to="/inventory" className="nav-link">
                        Manage Your Pantry
                    </Link>
                    <Link to="/recipes" className="nav-link">
                        Discover Recipes
                    </Link>
                    <Link to="/upload-receipt" className="nav-link">
                        Upload Receipts
                    </Link>
                </nav>
            </section>
            
            {/* Features Section */}
            <section className="features">
                <div className="feature">
                    <img src={uploadImage} alt="Upload Icon" className="feature__image" />
                    <h3>Upload Receipts</h3>
                    <p>Instantly add your groceries by uploading receipts.</p>
                </div>
                <div className="feature">
                    <img src={closeupImage} alt="Closeup of hands writing" className="feature__image" />
                    <h3>Track Expiry Dates</h3>
                    <p>Never let food go bad again. Stay on top of expiration dates.</p>
                </div>
                <div className="feature">
                    <img src={recipesIcon} alt="Recipes Icon" className="feature__image" />
                    <h3>Get Recipe Ideas</h3>
                    <p>Cook personalized recipes based on your pantry inventory.</p>
                </div>
            </section>
        </div>
    );
}

export default Home;
