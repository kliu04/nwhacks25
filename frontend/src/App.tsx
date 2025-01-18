
import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home.tsx';
import About from './Pages/Welcome.tsx';
import Inventory from './Pages/Inventory.tsx';
import React from "react";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/welcome" element={<About />} />
                <Route path="/inventory" element={<Inventory />} />
            </Routes>
        </Router>
    );
};

export default App;
