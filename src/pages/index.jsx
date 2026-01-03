import Layout from "./Layout.jsx";

import DecisionTree from "./DecisionTree";
import Home from "./Home";
import KNN from "./KNN";
import LinearRegression from "./LinearRegression";
import LogisticRegression from "./LogisticRegression";
import NeuralNetwork from "./NeuralNetwork";
import RandomForest from "./RandomForest";

import { HashRouter as Router, Route, Routes, useLocation } from "react-router-dom";

const PAGES = {
  DecisionTree,
  Home,
  KNN,
  LinearRegression,
  LogisticRegression,
  NeuralNetwork,
  RandomForest,
};

function _getCurrentPage(pathname) {
  // pathname will be like "/Home" when using HashRouter
  const clean = (pathname || "/").replace(/\/+$/, ""); // remove trailing slash
  const last = clean.split("/").pop() || "";
  const pageName = Object.keys(PAGES).find(
    (p) => p.toLowerCase() === last.toLowerCase()
  );
  return pageName || "Home";
}

function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        {/* default route */}
        <Route path="/" element={<Home />} />

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
    <Router>
      <PagesContent />
    </Router>
  );
}
