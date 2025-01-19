import { Link } from "react-router-dom";
import "./Home.css"; // Import the updated CSS

function Home() {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <h1>Stop throwing away food. Save money. Discover new recipes</h1>
                <p>
                    Upload your receipts and let us track your food's expiry dates. 
                    We'll suggest recipes based on your inventory, helping you reduce waste and save money.
                </p>
                <button className="cta-button">Try it for free</button>
            </section>

            {/* Navigation Links */}
            <section className="navigation">
                <nav>
                    <Link to="/inventory" className="nav-link">
                        Manage Your Pantry
                    </Link>
                </nav>
                <nav>
                    <Link to="/recipes" className="nav-link">
                        Discover Recipes
                    </Link>
                </nav>
                <nav>
                    <Link to="/upload-receipt" className="nav-link">
                        Upload Receipts
                    </Link>
                </nav>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="feature">
                    <img src="path-to-upload-icon.png" alt="Upload Icon" />
                    <h3>Upload Receipts</h3>
                    <p>Instantly add your groceries by uploading receipts.</p>
                </div>
                <div className="feature">
                    <img src="path-to-tracking-icon.png" alt="Track Icon" />
                    <h3>Track Expiry Dates</h3>
                    <p>Never let food go bad again. Stay on top of expiration dates.</p>
                </div>
                <div className="feature">
                    <img src="path-to-recipes-icon.png" alt="Recipes Icon" />
                    <h3>Get Recipe Ideas</h3>
                    <p>Cook personalized recipes based on your pantry inventory.</p>
                </div>
            </section>
        </div>
    );
}

export default Home;
