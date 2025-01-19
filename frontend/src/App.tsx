
import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home.tsx';
import Inventory from './Pages/Inventory.tsx';
import GetStarted from './Pages/GetStarted.tsx';
import UploadReceipt from './Pages/UploadReceipt.tsx';
import SignInPage from "./Pages/SignInPage.tsx";
import ConfirmationPage from "./Pages/ConfirmationPage.tsx";
import Recipes from "./Pages/Recipes.tsx";
import React from "react";
//

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path = "/getstarted" element={<GetStarted />} />
                <Route path = "/upload-receipt" element={<UploadReceipt />} />
                <Route path = "/signin" element={<SignInPage />} />
                <Route path = "/confirmation" element={<ConfirmationPage />} />
                <Route path = "/recipes" element={<Recipes />} />
            </Routes>
        </Router>
    );
};

export default App;
