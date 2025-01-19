import { Link } from "react-router-dom";

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <nav>
                <Link to="/inventory">Inventory</Link>
            </nav>
            <nav>
                <Link to="/recipes">Recipes</Link>
            </nav>
            <nav>
                <Link to="/upload-receipt">Upload a Receipt</Link>
            </nav>
        </div>
    );
}

export default Home;
