# 🧠 ML Playground — Interactive Machine Learning Visualization Playground  
**React + Vite + Tailwind CSS** • Fully client-side • Static Deployment (GitHub Pages)

ML Playground is an interactive, browser-based machine learning visualization playground designed to help learners build **intuition-first understanding** of core ML algorithms.

Instead of only reading formulas or running black-box code, ML Playground lets you:
- **see decision boundaries change in real-time**
- **tune hyperparameters live**
- **interact with datasets visually**
- understand **why** algorithms behave the way they do

✅ Runs **entirely in the browser** (no backend)  
✅ Works as a **static site** (GitHub Pages ready)  
✅ Built for learning, teaching, and experimentation  

---

## 🌐 Live Demo

🔗 **https://aryan9dwivedi.github.io/Ml-Playground/#/home**

> Note: Static hosting is supported via hash-based routing (`#/home`).

---

# 📌 Table of Contents

- [Why ML Playground](#-why-ml-playground)
- [Features](#-features)
- [Supported Algorithms](#-supported-algorithms)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Data & Visualization Flow](#-data--visualization-flow)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Build & Deployment](#-build--deployment)
- [Algorithm Documentation](#-algorithm-documentation)
  - [Linear Regression](#linear-regression)
  - [Logistic Regression](#logistic-regression)
  - [K-Nearest Neighbors (KNN)](#k-nearest-neighbors-knn)
  - [Decision Trees](#decision-trees)
  - [Random Forest](#random-forest)
  - [Neural Networks](#neural-networks)
- [Diagrams](#-diagrams)
- [Performance Notes](#-performance-notes)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🎯 Why ML Playground?

Most ML learning resources are either:
- purely theoretical (hard to visualize), or
- purely implementation-focused (hard to build intuition)

ML Playground sits in the middle by making ML:
✅ **visual**  
✅ **interactive**  
✅ **experiment-driven**  

The core idea is simple:

> Change a hyperparameter → instantly see the algorithm behave differently.

Examples:
- Increase **K** in KNN → boundary becomes smoother  
- Increase **tree depth** → overfitting becomes visible  
- Adjust **regularization** → decision boundary complexity changes  
- Change **learning rate** → training stability shifts  

---

## ✨ Features

### ✅ Interactive Visualizations
- Real-time dataset plots
- Decision boundary visualization for classification models
- Regression line updates for regression models
- Dataset selection and manipulation (where applicable)

### ✅ Live Hyperparameter Tuning
- Sliders, dropdowns, and toggles for key parameters
- Immediate UI feedback and re-render
- Algorithm-specific controls with consistent design

### ✅ Learning-Friendly UI
- Minimal layout (no clutter)
- Focused explanations per algorithm
- Easy navigation between models
- Smooth transitions/animations

### ✅ Fully Client-Side
- No backend
- No server needed
- Runs as a static site

---

## 🧠 Supported Algorithms

### Regression
- **Linear Regression**

### Classification
- **Logistic Regression**
- **K-Nearest Neighbors (KNN)**
- **Decision Trees**
- **Random Forest**
- **Neural Networks** (basic feedforward)

---

## 🧱 Tech Stack

### Frontend
- **React 18**
- **Vite**
- **React Router** (configured for static hosting)

### UI / Styling
- **Tailwind CSS**
- **shadcn/ui (Radix UI)**

### Visualization
- **SVG-based rendering**
- **Recharts**
- **Framer Motion** (animations)

### Deployment
- **GitHub Pages** (static)

---

## 🏗️ Architecture Overview

The project is structured into three main layers:

1. **UI Layer**
   - React pages/components
   - layout, controls, theory panels

2. **Algorithm Engine**
   - pure computation (`fit`, `predict`, boundary generation)
   - isolated from UI to stay modular and testable

3. **Visualization Layer**
   - plot rendering (SVG/Recharts)
   - decision boundaries, points, regression lines

### High-Level Architecture Diagram

## 🏗️ System Architecture (High-Level)

```text
┌───────────────────────────────────────────────────────────────────────┐
│                               UI LAYER                                │
│        Pages • Components • shadcn/ui • Tailwind • Router             │
│   Controls (sliders/buttons) • Theory Panel • Layout • Navigation     │
└───────────────────────────────┬───────────────────────────────────────┘
                                │ state (hyperparams, dataset, toggles)
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                          CONTROLLER / STATE                           │
│                 React State • Hooks • Derived State                   │
│        debounced updates • memoization • validation (optional)        │
└───────────────┬─────────────────────────────────────────┬─────────────┘
                │                                         │
                │ fit/predict/boundary computation         │ render primitives
                ▼                                         ▼
┌──────────────────────────────────────────┐   ┌─────────────────────────┐
│            ALGORITHM ENGINE              │   │   VISUALIZATION LAYER   │
│  fit() • predict() • decisionBoundary()  │   │ SVG • Recharts • Canvas │
│  metrics() • training loop (if any)      │   │ plot points • draw lines│
└───────────────────────┬──────────────────┘   └──────────────┬──────────┘
                        │                                     │
                        │ uses / transforms data              │ consumes render data
                        ▼                                     ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        DATASET / SIMULATION LAYER                     │
│ presets • synthetic generators • noise • normalization • splits       │
└───────────────────────────────────────────────────────────────────────┘


