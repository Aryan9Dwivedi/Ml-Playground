import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Play, Pause, RotateCcw, Sparkles, Trash2, Database, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TutorialSystem from '@/components/shared/TutorialSystem';
import { logisticRegressionTutorial } from '@/components/shared/tutorials';
import AlgorithmLayout from '@/components/shared/AlgorithmLayout';
import DataCanvas from '@/components/shared/DataCanvas';
import HyperparameterPanel from '@/components/shared/HyperparameterPanel';
import MetricsDisplay from '@/components/shared/MetricsDisplay';
import FormulaDisplay from '@/components/shared/FormulaDisplay';
import MathExplanation from '@/components/shared/MathExplanation';
import Tooltip, { InfoIcon } from '@/components/shared/Tooltip';

const generateSampleData = () => {
  const points = [];
  for (let i = 0; i < 12; i++) {
    points.push({
      x: Math.random() * 3 + 1,
      y: Math.random() * 3 + 1,
      class: 0
    });
  }
  for (let i = 0; i < 12; i++) {
    points.push({
      x: Math.random() * 3 + 6,
      y: Math.random() * 3 + 6,
      class: 1
    });
  }
  return points;
};

const sigmoid = (z) => 1 / (1 + Math.exp(-z));

export default function LogisticRegression() {
  const [points, setPoints] = useState(generateSampleData());
  const [currentClass, setCurrentClass] = useState(0);
  const [params, setParams] = useState({
    learningRate: {
      type: 'slider',
      label: 'Learning Rate (α)',
      value: 0.1,
      min: 0.01,
      max: 1,
      step: 0.01,
      decimals: 2,
      description: 'Speed of learning. Higher = faster but less stable convergence.'
    },
    iterations: {
      type: 'slider',
      label: 'Max Iterations',
      value: 200,
      min: 50,
      max: 1000,
      step: 50,
      decimals: 0,
      description: 'Number of training cycles through the dataset.'
    },
    threshold: {
      type: 'slider',
      label: 'Decision Threshold',
      value: 0.5,
      min: 0.1,
      max: 0.9,
      step: 0.05,
      decimals: 2,
      description: 'Probability cutoff: P ≥ threshold → Class 1, else Class 0'
    }
  });
  
  const [weights, setWeights] = useState({ w1: 0, w2: 0, b: 0 });
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const calculateLoss = useCallback((w1, w2, b, data) => {
    if (data.length === 0) return 0;
    let loss = 0;
    data.forEach(p => {
      const z = w1 * p.x + w2 * p.y + b;
      const pred = sigmoid(z);
      loss += -p.class * Math.log(pred + 1e-15) - (1 - p.class) * Math.log(1 - pred + 1e-15);
    });
    return loss / data.length;
  }, []);
  
  const runGradientDescent = useCallback(() => {
    const lr = params.learningRate.value;
    const maxIter = params.iterations.value;
    const newHistory = [];
    
    let w1 = 0, w2 = 0, b = 0;
    
    for (let i = 0; i < maxIter; i++) {
      let dw1 = 0, dw2 = 0, db = 0;
      
      points.forEach(p => {
        const z = w1 * p.x + w2 * p.y + b;
        const pred = sigmoid(z);
        const error = pred - p.class;
        dw1 += error * p.x;
        dw2 += error * p.y;
        db += error;
      });
      
      dw1 /= points.length;
      dw2 /= points.length;
      db /= points.length;
      
      const loss = calculateLoss(w1, w2, b, points);
      
      newHistory.push({
        step: i,
        w1, w2, b,
        loss,
        dw1, dw2, db
      });
      
      w1 -= lr * dw1;
      w2 -= lr * dw2;
      b -= lr * db;
    }
    
    newHistory.push({
      step: maxIter,
      w1, w2, b,
      loss: calculateLoss(w1, w2, b, points),
      dw1: 0, dw2: 0, db: 0
    });
    
    setHistory(newHistory);
    setCurrentStep(0);
  }, [points, params, calculateLoss]);
  
  useEffect(() => {
    runGradientDescent();
  }, [runGradientDescent]);
  
  useEffect(() => {
    if (history.length > 0 && currentStep < history.length) {
      const current = history[currentStep];
      setWeights({ w1: current.w1, w2: current.w2, b: current.b });
    }
  }, [currentStep, history]);
  
  useEffect(() => {
    let interval;
    if (isTraining && currentStep < history.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= history.length - 1) {
            setIsTraining(false);
            return prev;
          }
          return prev + 1;
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isTraining, currentStep, history.length]);
  
  const accuracy = (() => {
    if (points.length === 0) return 0;
    let correct = 0;
    points.forEach(p => {
      const z = weights.w1 * p.x + weights.w2 * p.y + weights.b;
      const pred = sigmoid(z) >= params.threshold.value ? 1 : 0;
      if (pred === p.class) correct++;
    });
    return correct / points.length;
  })();
  
  const renderDecisionBoundary = ({ scaleX, scaleY, xRange, yRange, chartWidth, chartHeight, padding }) => {
    const resolution = 35;
    const rects = [];
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = xRange[0] + (i / resolution) * (xRange[1] - xRange[0]);
        const y = yRange[0] + (j / resolution) * (yRange[1] - yRange[0]);
        const z = weights.w1 * x + weights.w2 * y + weights.b;
        const prob = sigmoid(z);
        
        const rectX = scaleX(x);
        const rectY = scaleY(y + (yRange[1] - yRange[0]) / resolution);
        const rectW = chartWidth / resolution;
        const rectH = chartHeight / resolution;
        
        const color = prob > 0.5 
          ? `rgba(139, 92, 246, ${Math.abs(prob - 0.5) * 0.8})`
          : `rgba(59, 130, 246, ${Math.abs(prob - 0.5) * 0.8})`;
        
        rects.push(
          <rect
            key={`${i}-${j}`}
            x={rectX}
            y={rectY}
            width={rectW + 1}
            height={rectH + 1}
            fill={color}
          />
        );
      }
    }
    
    const boundaryPoints = [];
    if (Math.abs(weights.w2) > 0.001) {
      for (let x = xRange[0]; x <= xRange[1]; x += 0.1) {
        const y = -(weights.w1 * x + weights.b) / weights.w2;
        if (y >= yRange[0] && y <= yRange[1]) {
          boundaryPoints.push({ x, y });
        }
      }
    }
    
    return (
      <g>
        {rects}
        {boundaryPoints.length > 1 && (
          <path
            d={`M ${boundaryPoints.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' L ')}`}
            fill="none"
            stroke="#fff"
            strokeWidth={4}
            strokeDasharray="10,5"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.6))' }}
          />
        )}
        {boundaryPoints.length > 1 && (
          <text
            x={scaleX(boundaryPoints[Math.floor(boundaryPoints.length / 2)].x)}
            y={scaleY(boundaryPoints[Math.floor(boundaryPoints.length / 2)].y) - 10}
            fill="#fff"
            fontSize={11}
            fontWeight="bold"
            textAnchor="middle"
            className="pointer-events-none"
          >
            Decision Boundary
          </text>
        )}
      </g>
    );
  };
  
  const theory = (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700">
      <div>
        <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Understanding Logistic Regression
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Logistic regression is used when you want to classify things into two categories (yes/no, spam/not spam, 0/1).
          Unlike linear regression which predicts numbers, this predicts probabilities between 0 and 1 using the sigmoid function.
          The decision boundary is the line that separates the two classes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-300 mb-2">🎯 Sigmoid Function</h4>
          <p className="font-mono text-white text-lg mb-2">σ(z) = 1/(1+e⁻ᶻ)</p>
          <p className="text-xs text-slate-400">Squashes any number into 0-1 range, giving us probabilities</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-300 mb-2">📊 Decision Rule</h4>
          <p className="font-mono text-white text-sm mb-2">if P ≥ 0.5: Class 1<br/>else: Class 0</p>
          <p className="text-xs text-slate-400">Threshold determines classification</p>
        </div>
        
        <div className="bg-gradient-to-br from-rose-900/30 to-rose-800/20 border border-rose-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-rose-300 mb-2">📉 Cross-Entropy Loss</h4>
          <p className="font-mono text-white text-xs mb-2">L = -y·log(p) - (1-y)·log(1-p)</p>
          <p className="text-xs text-slate-400">Penalizes wrong predictions heavily</p>
        </div>
      </div>
      
      <MathExplanation
        title="How Logistic Regression Works"
        intuition="Imagine drawing a line to separate apples from oranges on a table. Points on one side are likely apples (P>0.5), the other side are oranges (P<0.5). The sigmoid function smoothly transitions the probability from 0 to 1 as you cross the line."
        steps={[
          {
            text: "Calculate the linear combination (like linear regression)",
            formula: "z = w₁·x₁ + w₂·x₂ + b",
            explanation: "Combine features with weights to get a score"
          },
          {
            text: "Apply sigmoid function to get probability",
            formula: "P(y=1) = σ(z) = 1/(1 + e⁻ᶻ)",
            explanation: "Transform score into probability between 0 and 1"
          },
          {
            text: "Calculate binary cross-entropy loss",
            formula: "L = -(y·log(p) + (1-y)·log(1-p))",
            explanation: "Measure how wrong our predictions are"
          },
          {
            text: "Compute gradients of loss",
            formula: "∂L/∂w = (p - y)·x",
            explanation: "Find direction to adjust weights"
          },
          {
            text: "Update weights using gradient descent",
            formula: "w := w - α·∂L/∂w",
            explanation: "Move weights to reduce loss"
          }
        ]}
        example={[
          "Example: Point at (7, 8), actual class = 1",
          "z = 0.5·7 + 0.4·8 + (-5) = 1.7",
          "p = σ(1.7) = 1/(1+e⁻¹·⁷) = 0.846",
          "Since p > 0.5, predict Class 1 ✓",
          "Loss = -(1·log(0.846)) = 0.167",
          "Gradient: ∂L/∂w₁ = (0.846-1)·7 = -1.078"
        ]}
      />
    </div>
  );
  
  return (
    <AlgorithmLayout
      title="Logistic Regression"
      description="Binary classification using sigmoid activation and probabilistic decision boundaries"
      icon={GitBranch}
      color="from-violet-500 to-purple-500"
      theory={theory}
    >
      {showTutorial && <TutorialSystem tutorial={logisticRegressionTutorial} onClose={() => setShowTutorial(false)} renderInteractive={() => <div className="text-slate-300 p-4 bg-slate-900 rounded">Interact with controls above!</div>} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-lg">Decision Boundary Visualization</h3>
                <InfoIcon content="Click to add points. Color intensity shows probability: darker purple = more likely Class 1, darker blue = more likely Class 0. White dashed line is the decision boundary (P=0.5)." />
              </div>
              <div className="flex gap-2">
                <div className="flex border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setCurrentClass(0)}
                    className={`px-3 py-1.5 text-sm font-medium transition-all ${currentClass === 0 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    Class 0
                  </button>
                  <button
                    onClick={() => setCurrentClass(1)}
                    className={`px-3 py-1.5 text-sm font-medium transition-all ${currentClass === 1 ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    Class 1
                  </button>
                </div>
                <Tooltip content="Generate new random data">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPoints(generateSampleData())}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </Tooltip>
              </div>
            </div>
            <DataCanvas
              points={points}
              setPoints={setPoints}
              currentClass={currentClass}
              width={560}
              height={360}
              xLabel="Feature X₁"
              yLabel="Feature X₂"
              renderOverlay={renderDecisionBoundary}
              pointColors={['#3b82f6', '#8b5cf6']}
            />
          </div>
          
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 font-medium">Training Progress</span>
                  <InfoIcon content="Watch the decision boundary evolve as the algorithm learns to separate the two classes." />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-mono">
                    {currentStep}
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-xl text-slate-400 font-mono">{history.length - 1}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Tooltip content="Reset to start">
                  <Button onClick={() => { setCurrentStep(0); setIsTraining(false); }} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content={isTraining ? "Pause animation" : "Start training animation"}>
                  <Button onClick={() => setIsTraining(!isTraining)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    {isTraining ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isTraining ? 'Pause' : 'Animate'}
                  </Button>
                </Tooltip>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={history.length - 1}
              value={currentStep}
              onChange={(e) => { setCurrentStep(parseInt(e.target.value)); setIsTraining(false); }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-medium text-slate-400">Sigmoid Function</h4>
                <InfoIcon content="The S-shaped curve that converts any value into a probability between 0 and 1." />
              </div>
              <svg width="100%" height={120} viewBox="0 0 200 120">
                <defs>
                  <linearGradient id="sigmoidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <path
                  d={Array.from({ length: 100 }, (_, i) => {
                    const x = (i / 99) * 190 + 5;
                    const z = (i / 99) * 12 - 6;
                    const y = 110 - sigmoid(z) * 100;
                    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                  }).join(' ') + ' L195,110 L5,110 Z'}
                  fill="url(#sigmoidGrad)"
                />
                <path
                  d={Array.from({ length: 100 }, (_, i) => {
                    const x = (i / 99) * 190 + 5;
                    const z = (i / 99) * 12 - 6;
                    const y = 110 - sigmoid(z) * 100;
                    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                />
                <line x1={5} y1={110 - params.threshold.value * 100} x2={195} y2={110 - params.threshold.value * 100} stroke="#f43f5e" strokeWidth={2} strokeDasharray="5,3" />
                <text x={5} y={15} fill="#8b5cf6" fontSize={11} fontWeight="bold">P = 1</text>
                <text x={5} y={115} fill="#8b5cf6" fontSize={11} fontWeight="bold">P = 0</text>
                <text x={150} y={110 - params.threshold.value * 100 - 5} fill="#f43f5e" fontSize={10}>θ={params.threshold.value}</text>
              </svg>
            </div>
            
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-medium text-slate-400">Loss Over Time</h4>
                <InfoIcon content="Cross-entropy loss decreases as the model improves at classifying the data correctly." />
              </div>
              <svg width="100%" height={120} viewBox="0 0 200 120">
                {history.length > 1 && (() => {
                  const maxLoss = Math.max(...history.map(h => h.loss), 0.1);
                  const path = history.map((h, i) => {
                    const x = (i / (history.length - 1)) * 190 + 5;
                    const y = 110 - (h.loss / maxLoss) * 100;
                    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                  }).join(' ');
                  const currentX = (currentStep / (history.length - 1)) * 190 + 5;
                  const currentY = 110 - (history[currentStep]?.loss / maxLoss) * 100;
                  return (
                    <>
                      <path d={path + ' L195,110 L5,110 Z'} fill="url(#sigmoidGrad)" />
                      <path d={path} fill="none" stroke="#f43f5e" strokeWidth={2} />
                      <circle cx={currentX} cy={currentY} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Dataset Info */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Database className="w-4 h-4 text-purple-400" />
              </div>
              <h4 className="text-sm font-medium text-slate-400">Dataset Overview</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                <div className="text-2xl font-bold text-purple-400">{points.length}</div>
                <div className="text-xs text-slate-400 mt-1">Total Points</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                <div className="text-2xl font-bold text-blue-400">2</div>
                <div className="text-xs text-slate-400 mt-1">Classes</div>
              </div>
            </div>
            <div className="space-y-2">
              {[0, 1].map(cls => {
                const count = points.filter(p => p.class === cls).length;
                return (
                  <div key={cls} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls === 0 ? '#3b82f6' : '#8b5cf6' }} />
                      <span className="text-slate-300">Class {cls}</span>
                    </div>
                    <span className="font-mono font-semibold" style={{ color: cls === 0 ? '#3b82f6' : '#8b5cf6' }}>
                      {count} ({((count / points.length) * 100).toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <HyperparameterPanel params={params} onChange={setParams} title="Training Parameters" />
          
          <MetricsDisplay
            metrics={[
              { label: 'Cross-Entropy Loss', value: history[currentStep]?.loss || 0, decimals: 6, tooltip: 'Lower is better. Measures how confident and correct predictions are.' },
              { label: 'Accuracy', value: accuracy * 100, decimals: 1, description: '%', tooltip: 'Percentage of correctly classified points. 100% = perfect!' },
              { label: 'Weight w₁', value: weights.w1, decimals: 4, tooltip: 'Coefficient for feature X₁ in the decision function.' },
              { label: 'Weight w₂', value: weights.w2, decimals: 4, tooltip: 'Coefficient for feature X₂ in the decision function.' }
            ]}
          />
          
          <div className="space-y-3">
            <FormulaDisplay
              title="Decision Boundary"
              formula={`${weights.w1.toFixed(3)}x₁ + ${weights.w2.toFixed(3)}x₂ + ${weights.b.toFixed(3)} = 0`}
              highlighted
              explanation="Points on one side have P>0.5 (Class 1), other side P<0.5 (Class 0)"
            />
            
            <FormulaDisplay
              title="Probability Model"
              formula="P(y=1|x) = σ(w₁x₁ + w₂x₂ + b)"
              explanation="Sigmoid squashes the linear combination into a probability"
            />
          </div>
          
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-medium text-slate-400">Classification Legend</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg" />
                <span className="text-sm text-slate-300">Class 0: P &lt; {params.threshold.value}</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="w-4 h-4 rounded-full bg-purple-500 shadow-lg" />
                <span className="text-sm text-slate-300">Class 1: P ≥ {params.threshold.value}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AlgorithmLayout>
  );
}