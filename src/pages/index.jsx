import Layout from "./Layout.jsx";

import DecisionTree from "./DecisionTree";

import Home from "./Home";

import KNN from "./KNN";

import LinearRegression from "./LinearRegression";

import LogisticRegression from "./LogisticRegression";

import NeuralNetwork from "./NeuralNetwork";

import RandomForest from "./RandomForest";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    DecisionTree: DecisionTree,
    
    Home: Home,
    
    KNN: KNN,
    
    LinearRegression: LinearRegression,
    
    LogisticRegression: LogisticRegression,
    
    NeuralNetwork: NeuralNetwork,
    
    RandomForest: RandomForest,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<DecisionTree />} />
                
                
                <Route path="/DecisionTree" element={<DecisionTree />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/KNN" element={<KNN />} />
                
                <Route path="/LinearRegression" element={<LinearRegression />} />
                
                <Route path="/LogisticRegression" element={<LogisticRegression />} />
                
                <Route path="/NeuralNetwork" element={<NeuralNetwork />} />
                
                <Route path="/RandomForest" element={<RandomForest />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router basename={import.meta.env.BASE_URL}>
        <PagesContent />
        </Router>

    );
}