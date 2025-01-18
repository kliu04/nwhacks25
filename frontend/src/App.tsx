
import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home.tsx';
import About from './Pages/Welcome.tsx';
import Inventory from './Pages/Inventory.tsx';
import GetStarted from './Pages/GetStarted';
import UploadReceipt from './Pages/UploadReceipt';
import SignInPage from "./Pages/SignInPage.tsx";
import React from "react";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/welcome" element={<About />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path = "/getstarted" element={<GetStarted />} />
                <Route path = "/upload-receipt" element={<UploadReceipt />} />
                <Route path = "/signin" element={<SignInPage />} />
            </Routes>
        </Router>
    );
};

export default App;
