// Tutorial content for all ML algorithms

export const linearRegressionTutorial = {
  title: "Linear Regression Mastery",
  description: "Learn how gradient descent finds the best-fit line step by step",
  steps: [
    {
      title: "What is Linear Regression?",
      content: "Linear regression finds the straight line that best fits your data points. It's like drawing a line through scattered dots to predict where future points might be!",
      keyConcept: "The goal is to find the line y = mx + b that minimizes the distance between predicted and actual values.",
      example: "If you have data on house sizes (x) and prices (y), linear regression helps predict prices for new houses based on their size.",
      tips: [
        "The slope (m) tells you how much y changes when x increases by 1",
        "The intercept (b) is where the line crosses the y-axis"
      ],
      interactive: {
        type: 'addPoints',
        title: 'Add Your Own Points',
        instruction: 'Click on the canvas to add points. Watch how the regression line adjusts!'
      }
    },
    {
      title: "Understanding the Cost Function (MSE)",
      content: "The Mean Squared Error (MSE) measures how wrong our predictions are. It's the average of all squared differences between predicted and actual values.",
      formula: "MSE = (1/n) Σ(yᵢ - ŷᵢ)²",
      formulaExplanation: "We square the errors so positive and negative errors don't cancel out, and larger errors are penalized more heavily.",
      keyConcept: "Lower MSE = better fit! Our goal is to minimize this value.",
      example: "If you predict 100 but the actual value is 90, the error is 10, and squared error is 100. Do this for all points and average them.",
      interactive: {
        type: 'adjustParams',
        title: 'See How MSE Changes',
        instruction: 'Adjust the slope and intercept. Watch the MSE increase when the line fits poorly!'
      }
    },
    {
      title: "Gradient Descent: The Learning Process",
      content: "Gradient descent is how the algorithm learns! It adjusts m and b in small steps, always moving downhill toward lower error.",
      formula: "m := m - α · (∂MSE/∂m)\nb := b - α · (∂MSE/∂b)",
      formulaExplanation: "α (alpha) is the learning rate. The gradient tells us which direction reduces error the most.",
      keyConcept: "Think of it like walking downhill in fog - you feel the slope and take small steps in the steepest direction.",
      tips: [
        "Large learning rate = fast but might overshoot the minimum",
        "Small learning rate = slow but stable convergence",
        "The algorithm iterates many times until the line stops improving"
      ],
      interactive: {
        type: 'animate',
        title: 'Watch Gradient Descent in Action',
        instruction: 'Adjust the learning rate and watch how it affects convergence speed!'
      }
    },
    {
      title: "Interpreting Results",
      content: "Once trained, you can use your model to make predictions and understand the relationship between variables.",
      keyConcept: "R² (R-squared) tells you how much of the variation in y is explained by x. 1.0 = perfect fit, 0 = no relationship.",
      example: "If R² = 0.85, then 85% of price variation is explained by house size. That's pretty good!",
      tips: [
        "Always check residuals (errors) - they should look random",
        "Outliers can strongly affect the line - consider removing them",
        "Linear regression assumes a linear relationship - check your scatter plot first"
      ]
    }
  ],
  quiz: {
    passingScore: 75,
    questions: [
      {
        question: "What does the slope (m) in y = mx + b represent?",
        options: [
          "The y-intercept",
          "How much y changes when x increases by 1",
          "The total error in predictions",
          "The learning rate"
        ],
        correctAnswer: 1,
        explanation: "Correct! The slope shows the rate of change - how much y increases (or decreases) for each unit increase in x."
      },
      {
        question: "Why do we square the errors in MSE instead of just averaging them?",
        options: [
          "To make the math easier",
          "Because negative and positive errors would cancel out",
          "To make the algorithm faster",
          "It doesn't matter - we could use absolute values"
        ],
        correctAnswer: 1,
        explanation: "Exactly! Without squaring, errors of +5 and -5 would sum to 0, hiding the fact that our predictions are wrong. Squaring also penalizes larger errors more."
      },
      {
        question: "What happens if the learning rate α is too large?",
        options: [
          "Training will be very slow",
          "The algorithm might overshoot and never converge",
          "MSE will always be zero",
          "Nothing - it doesn't affect training"
        ],
        correctAnswer: 1,
        explanation: "Right! A large learning rate causes big jumps that can overshoot the minimum. The algorithm might bounce around and never settle on the best line."
      },
      {
        question: "What does an R² value of 0.95 indicate?",
        options: [
          "The model is 95% accurate at predicting values",
          "95% of the variance in y is explained by x",
          "There are 95% fewer errors than before",
          "The slope is 0.95"
        ],
        correctAnswer: 1,
        explanation: "Perfect! R² = 0.95 means 95% of the variation in the target variable (y) can be explained by the input variable (x). This indicates a very strong linear relationship."
      }
    ]
  }
};

export const logisticRegressionTutorial = {
  title: "Logistic Regression Deep Dive",
  description: "Master classification with the sigmoid function and binary cross-entropy",
  steps: [
    { title: "From Linear to Logistic", content: "Logistic regression adapts linear regression for classification! Instead of predicting continuous values, we predict probabilities between 0 and 1 using the sigmoid function.", keyConcept: "The sigmoid function σ(z) = 1/(1+e^(-z)) transforms any value into a probability.", example: "Spam detection: Instead of predicting spam score of -5 or 10, we predict probability 0.05 (5% spam) or 0.99 (99% spam).", tips: ["Output is always between 0 and 1", "Threshold at 0.5 for binary decisions"] },
    { title: "The Sigmoid Function Magic", content: "Sigmoid squashes any input into (0,1) range, perfect for probabilities!", formula: "σ(z) = 1 / (1 + e^(-z))", formulaExplanation: "Large positive z → σ(z) ≈ 1. Large negative z → σ(z) ≈ 0. z=0 → σ(z) = 0.5", keyConcept: "The S-shaped curve creates smooth decision boundaries.", interactive: { type: 'sigmoid', title: 'Sigmoid Curve' } },
    { title: "Binary Cross-Entropy Loss", content: "We can't use MSE for classification! Cross-entropy measures how different our probability is from the true label (0 or 1).", formula: "L = -[y·log(ŷ) + (1-y)·log(1-ŷ)]", keyConcept: "Heavily penalizes confident wrong predictions!", example: "If y=1 (spam) but ŷ=0.01 (predicted not spam), loss is huge: -log(0.01) ≈ 4.6" },
    { title: "Decision Boundaries", content: "The model learns a boundary that separates classes. Non-linear boundaries require feature engineering or kernel methods.", keyConcept: "In 2D: boundary is a line. In higher dimensions: a hyperplane.", tips: ["Points far from boundary: confident predictions", "Points near boundary: uncertain predictions"] }
  ],
  quiz: { passingScore: 75, questions: [
    { question: "What is the range of the sigmoid function?", options: ["(-∞, ∞)", "(0, 1)", "[-1, 1]", "[0, ∞)"], correctAnswer: 1, explanation: "Sigmoid always outputs between 0 and 1, making it perfect for probabilities!" },
    { question: "What loss function do we use for binary classification?", options: ["Mean Squared Error", "Binary Cross-Entropy", "Absolute Error", "Hinge Loss"], correctAnswer: 1, explanation: "Binary cross-entropy is designed for probabilities and heavily penalizes confident wrong predictions." },
    { question: "If σ(z) = 0.9, what do we predict?", options: ["Class 0", "Class 1", "Both classes", "Neither"], correctAnswer: 1, explanation: "Since 0.9 > 0.5, we predict Class 1 with high confidence!" },
    { question: "What happens to cross-entropy loss when our confident prediction is wrong?", options: ["Loss is 0", "Loss is small", "Loss approaches infinity", "Loss is negative"], correctAnswer: 2, explanation: "Cross-entropy loss grows very large (approaches infinity) for confident wrong predictions, forcing the model to learn!" }
  ]}
};

export const decisionTreeTutorial = {
  title: "Decision Trees Explained",
  description: "Learn how trees split data using information gain",
  steps: [
    { title: "Trees Make Decisions", content: "Decision trees ask yes/no questions about features to classify data. Each internal node is a question, each leaf is a prediction!", keyConcept: "Like a flowchart: follow the path based on your answers, reach a conclusion.", example: "Classify fruit: Is it round? → Yes → Is it orange? → Yes → Orange!" },
    { title: "Information Gain & Entropy", content: "Trees choose splits that maximize information gain - reduce uncertainty the most!", formula: "H(S) = -Σ pᵢ·log₂(pᵢ)\nIG = H(parent) - Σ (|child|/|parent|)·H(child)", keyConcept: "Entropy = 0 means pure (all same class). Entropy = 1 means maximum disorder." },
    { title: "Overfitting & Pruning", content: "Deep trees memorize training data! Control depth and min samples to prevent overfitting.", keyConcept: "Max depth = how many questions to ask. Higher = more complex but risky.", tips: ["Start with depth 3-5", "Use validation set to tune depth"] }
  ],
  quiz: { passingScore: 75, questions: [
    { question: "What does a leaf node contain?", options: ["A split rule", "A prediction", "Training data", "Entropy value"], correctAnswer: 1, explanation: "Leaf nodes are terminal - they make the final prediction!" },
    { question: "What does entropy measure?", options: ["Tree depth", "Impurity/disorder", "Accuracy", "Number of samples"], correctAnswer: 1, explanation: "Entropy measures how mixed the classes are. 0 = pure, higher = more mixed." },
    { question: "How do we prevent overfitting?", options: ["Use more data", "Limit tree depth", "Both A and B", "Never possible"], correctAnswer: 2, explanation: "More data and limiting depth both help prevent overfitting!" },
    { question: "What is information gain?", options: ["Accuracy increase", "Reduction in entropy after split", "Tree size", "Prediction confidence"], correctAnswer: 1, explanation: "Information gain = how much we reduce uncertainty by making a split!" }
  ]}
};

export const randomForestTutorial = {
  title: "Random Forest Mastery",
  description: "Understand ensemble learning through bootstrapping and voting",
  steps: [
    { title: "Many Trees are Better than One", content: "Random Forest trains many decision trees on random subsets of data. Each tree votes, majority wins!", keyConcept: "Wisdom of crowds: individual trees make mistakes in different places, voting averages out errors.", example: "5 trees vote: [Class A, Class A, Class B, Class A, Class B] → Predict Class A (3 votes)" },
    { title: "Bootstrap Sampling (Bagging)", content: "Each tree trains on a random sample WITH replacement. Same point can appear multiple times!", formula: "Sample size ≈ 63% of original data", keyConcept: "Creates diversity - each tree sees slightly different data." },
    { title: "Feature Randomness", content: "At each split, only consider a random subset of features. Prevents trees from being too similar!", formula: "Typical: √(n_features) features per split", keyConcept: "Without this, all trees would split on the strongest feature first." }
  ],
  quiz: { passingScore: 75, questions: [
    { question: "How do Random Forests make predictions?", options: ["Use the first tree", "Majority vote", "Average all trees", "Use the best tree"], correctAnswer: 1, explanation: "All trees vote, and the majority class wins!" },
    { question: "What is bootstrap sampling?", options: ["No sampling", "Sample without replacement", "Sample with replacement", "Use all data"], correctAnswer: 2, explanation: "Bootstrap = sample WITH replacement, so same point can appear multiple times." },
    { question: "Why use feature randomness?", options: ["Faster training", "Create diversity among trees", "Reduce tree depth", "Improve accuracy always"], correctAnswer: 1, explanation: "Feature randomness ensures trees make different decisions, creating a diverse ensemble!" },
    { question: "What is the main benefit of Random Forest over single Decision Tree?", options: ["Faster", "Less overfitting", "Simpler", "Requires less data"], correctAnswer: 1, explanation: "Ensembles reduce overfitting by averaging out errors from individual trees!" }
  ]}
};

export const neuralNetworkTutorial = {
  title: "Neural Networks Fundamentals",
  description: "Understand forward propagation, backpropagation, and training",
  steps: [
    { title: "Inspired by the Brain", content: "Neural networks are layers of connected neurons. Information flows forward, errors flow backward!", keyConcept: "Each neuron computes a weighted sum of inputs + bias, then applies an activation function.", example: "Input → Hidden layers (extract features) → Output (prediction)" },
    { title: "Forward Propagation", content: "Data flows through the network layer by layer, being transformed at each step.", formula: "z = Wx + b\na = σ(z)", keyConcept: "Matrix multiplication + activation creates complex non-linear transformations." },
    { title: "Backpropagation Magic", content: "Calculate gradients by propagating errors backward through the network using chain rule!", formula: "δ = ∂L/∂z\n∂L/∂W = δ·aᵀ", keyConcept: "Chain rule lets us compute how each weight contributed to the error." },
    { title: "Activation Functions", content: "Non-linearities like ReLU, sigmoid, tanh allow networks to learn complex patterns.", keyConcept: "Without activation: network is just linear regression! Activation = power.", tips: ["ReLU: most popular for hidden layers", "Sigmoid: good for binary output"] }
  ],
  quiz: { passingScore: 75, questions: [
    { question: "What flows backward in backpropagation?", options: ["Data", "Predictions", "Gradients/errors", "Activations"], correctAnswer: 2, explanation: "Backpropagation propagates error gradients backward to update weights!" },
    { question: "Why do we need activation functions?", options: ["Make training faster", "Enable non-linear learning", "Reduce overfitting", "Visualize better"], correctAnswer: 1, explanation: "Activation functions add non-linearity, allowing networks to learn complex patterns!" },
    { question: "What is a hidden layer?", options: ["Invisible layer", "Layer between input and output", "Output layer", "Input layer"], correctAnswer: 1, explanation: "Hidden layers are intermediate layers that extract progressively abstract features!" },
    { question: "What does 'deep' in deep learning mean?", options: ["Complex math", "Many hidden layers", "Big datasets", "Long training"], correctAnswer: 1, explanation: "'Deep' refers to networks with many hidden layers, creating hierarchical feature learning!" }
  ]}
};

export const knnTutorial = {
  title: "K-Nearest Neighbors Explained",
  description: "Master the intuitive classification algorithm based on proximity",
  steps: [
    {
      title: "The Basic Idea: Ask Your Neighbors",
      content: "KNN is beautifully simple: to classify a new point, find its K nearest neighbors and let them vote! The majority class wins.",
      keyConcept: "It's like asking your K closest friends for advice - if most say 'yes', you go with 'yes'!",
      example: "Imagine classifying whether an email is spam. Look at the 5 most similar emails you've seen before. If 4 are spam, predict spam!",
      tips: [
        "KNN requires NO training - it just memorizes the data",
        "All the work happens during prediction",
        "It works for any number of classes"
      ],
      interactive: {
        type: 'moveQuery',
        title: 'Move the Query Point',
        instruction: 'Drag the orange query point around. Watch how the prediction changes based on nearby neighbors!'
      }
    },
    {
      title: "Choosing K: The Most Important Decision",
      content: "K is the number of neighbors that vote. Small K = sensitive to noise. Large K = smoother but might miss local patterns.",
      keyConcept: "K should be odd (to avoid ties) and typically between 3 and 11 for most problems.",
      example: "K=1: Use only the closest point (very sensitive to outliers)\nK=5: More stable, considers local pattern\nK=100: Very smooth, might miss details",
      tips: [
        "Start with K=5 and adjust based on results",
        "Use cross-validation to find the best K",
        "Larger datasets can handle larger K values"
      ],
      interactive: {
        type: 'adjustK',
        title: 'Experiment with K',
        instruction: 'Change K and watch how decision boundaries become smoother or more jagged!'
      }
    },
    {
      title: "Distance Metrics: Measuring Closeness",
      content: "How do we measure 'nearest'? Different distance metrics give different results!",
      formula: "Euclidean: √((x₁-x₂)² + (y₁-y₂)²)\nManhattan: |x₁-x₂| + |y₁-y₂|",
      formulaExplanation: "Euclidean is straight-line distance (as the crow flies). Manhattan is grid-based distance (like city blocks).",
      keyConcept: "For most problems, Euclidean distance works well. Manhattan is good for grid-like data.",
      interactive: {
        type: 'changeMetric',
        title: 'Try Different Distances',
        instruction: 'Switch between Euclidean, Manhattan, and Chebyshev. See how distances change!'
      }
    },
    {
      title: "Weighted Voting: Closer = More Important",
      content: "Instead of each neighbor getting one vote, we can weight votes by distance. Closer neighbors have more influence!",
      formula: "weight = 1 / (distance + ε)",
      formulaExplanation: "Closer points get higher weights. We add a small ε to avoid division by zero.",
      keyConcept: "Weighted voting can improve accuracy, especially when K is large.",
      example: "With K=5, if the closest 2 neighbors are Class A and the farther 3 are Class B, weighted voting might still choose Class A because proximity matters more.",
      interactive: {
        type: 'toggleWeighting',
        title: 'Enable Distance Weighting',
        instruction: 'Toggle weighted voting on/off. Watch how predictions change when closer neighbors matter more!'
      }
    }
  ],
  quiz: {
    passingScore: 75,
    questions: [
      {
        question: "What does K represent in K-Nearest Neighbors?",
        options: [
          "The number of classes in the dataset",
          "The number of nearest neighbors that vote",
          "The learning rate",
          "The total number of data points"
        ],
        correctAnswer: 1,
        explanation: "Correct! K is the number of closest neighbors we consider when making a prediction. They all vote, and the majority class wins."
      },
      {
        question: "Why is it recommended to use an odd value for K?",
        options: [
          "Odd numbers are lucky",
          "To avoid ties in binary classification",
          "Even numbers don't work mathematically",
          "It makes the algorithm faster"
        ],
        correctAnswer: 1,
        explanation: "Exactly! With 2 classes and an even K, you could get a 50-50 split. Odd K ensures there's always a majority."
      },
      {
        question: "What is the main disadvantage of using K=1?",
        options: [
          "It's too slow",
          "It's very sensitive to noise and outliers",
          "It only works for binary classification",
          "It requires training"
        ],
        correctAnswer: 1,
        explanation: "Right! With K=1, a single noisy point can cause misclassification. Larger K values are more robust to outliers."
      },
      {
        question: "In weighted KNN, what happens to neighbors that are farther away?",
        options: [
          "They are ignored completely",
          "They get lower voting weights",
          "They get higher voting weights",
          "Distance doesn't affect weighting"
        ],
        correctAnswer: 1,
        explanation: "Perfect! Farther neighbors get smaller weights (often 1/distance), so nearby points have more influence on the final prediction."
      }
    ]
  }
};