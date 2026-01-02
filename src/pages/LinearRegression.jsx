import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Play, Pause, RotateCcw, Plus, Trash2, Sparkles, BarChart3, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TutorialSystem from '@/components/shared/TutorialSystem';
import { linearRegressionTutorial } from '@/components/shared/tutorials';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlgorithmLayout from '@/components/shared/AlgorithmLayout';
import DataCanvas from '@/components/shared/DataCanvas';
import HyperparameterPanel from '@/components/shared/HyperparameterPanel';
import MetricsDisplay from '@/components/shared/MetricsDisplay';
import FormulaDisplay from '@/components/shared/FormulaDisplay';
import MathExplanation from '@/components/shared/MathExplanation';
import Tooltip, { InfoIcon } from '@/components/shared/Tooltip';

const generateSampleData = () => {
  const points = [];
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 8 + 1;
    const y = 0.7 * x + 1.5 + (Math.random() - 0.5) * 2;
    points.push({ x, y, class: 0 });
  }
  return points;
};

export default function LinearRegression() {
  const [points, setPoints] = useState(generateSampleData());
  const [params, setParams] = useState({
    learningRate: {
      type: 'slider',
      label: 'Learning Rate (α)',
      value: 0.01,
      min: 0.001,
      max: 0.1,
      step: 0.001,
      decimals: 3,
      description: 'Step size for each gradient descent iteration. Higher values = faster but less stable learning.'
    },
    iterations: {
      type: 'slider',
      label: 'Max Iterations',
      value: 100,
      min: 10,
      max: 500,
      step: 10,
      decimals: 0,
      description: 'Number of times the algorithm updates the weights. More iterations = better fit (if converged).'
    }
  });
  
  const [weights, setWeights] = useState({ m: 0, b: 0 });
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [gradients, setGradients] = useState({ dm: 0, db: 0 });
  const [showTutorial, setShowTutorial] = useState(false);
  
  const calculateMSE = useCallback((m, b, data) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, p) => {
      const predicted = m * p.x + b;
      return acc + Math.pow(p.y - predicted, 2);
    }, 0);
    return sum / data.length;
  }, []);
  
  const calculateGradients = useCallback((m, b, data) => {
    const n = data.length;
    if (n === 0) return { dm: 0, db: 0 };
    
    let dm = 0;
    let db = 0;
    
    data.forEach(p => {
      const predicted = m * p.x + b;
      const error = predicted - p.y;
      dm += error * p.x;
      db += error;
    });
    
    return {
      dm: (2 / n) * dm,
      db: (2 / n) * db
    };
  }, []);
  
  const runGradientDescent = useCallback(() => {
    const lr = params.learningRate.value;
    const maxIter = params.iterations.value;
    const newHistory = [];
    
    let m = 0;
    let b = 0;
    
    for (let i = 0; i < maxIter; i++) {
      const mse = calculateMSE(m, b, points);
      const grads = calculateGradients(m, b, points);
      
      newHistory.push({
        step: i,
        m: m,
        b: b,
        mse: mse,
        dm: grads.dm,
        db: grads.db
      });
      
      m = m - lr * grads.dm;
      b = b - lr * grads.db;
    }
    
    const finalMSE = calculateMSE(m, b, points);
    newHistory.push({
      step: maxIter,
      m: m,
      b: b,
      mse: finalMSE,
      dm: 0,
      db: 0
    });
    
    setHistory(newHistory);
    setCurrentStep(0);
  }, [points, params, calculateMSE, calculateGradients]);
  
  useEffect(() => {
    runGradientDescent();
  }, [runGradientDescent]);
  
  useEffect(() => {
    if (history.length > 0 && currentStep < history.length) {
      const current = history[currentStep];
      setWeights({ m: current.m, b: current.b });
      setGradients({ dm: current.dm, db: current.db });
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
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isTraining, currentStep, history.length]);
  
  const currentMSE = history[currentStep]?.mse || 0;
  const rSquared = (() => {
    if (points.length === 0) return 0;
    const meanY = points.reduce((a, p) => a + p.y, 0) / points.length;
    const ssTot = points.reduce((a, p) => a + Math.pow(p.y - meanY, 2), 0);
    const ssRes = points.reduce((a, p) => a + Math.pow(p.y - (weights.m * p.x + weights.b), 2), 0);
    return ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
  })();
  
  const renderRegressionLine = ({ scaleX, scaleY, xRange, yRange }) => {
    const x1 = xRange[0];
    const x2 = xRange[1];
    const y1 = weights.m * x1 + weights.b;
    const y2 = weights.m * x2 + weights.b;
    
    return (
      <g>
        {/* Prediction line with glow */}
        <defs>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Best fit line */}
        <line
          x1={scaleX(x1)}
          y1={scaleY(y1)}
          x2={scaleX(x2)}
          y2={scaleY(y2)}
          stroke="#3b82f6"
          strokeWidth={4}
          strokeLinecap="round"
          filter="url(#lineGlow)"
        />
        
        {/* Residual lines (errors) */}
        {points.map((point, i) => {
          const predicted = weights.m * point.x + weights.b;
          const error = Math.abs(point.y - predicted);
          return (
            <g key={i}>
              <line
                x1={scaleX(point.x)}
                y1={scaleY(point.y)}
                x2={scaleX(point.x)}
                y2={scaleY(predicted)}
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4,4"
                opacity={0.6}
              />
              {/* Error annotation on hover */}
              <Tooltip content={`Residual error: ${error.toFixed(3)}\nSquared error: ${(error * error).toFixed(3)}`}>
                <circle
                  cx={scaleX(point.x)}
                  cy={scaleY((point.y + predicted) / 2)}
                  r={4}
                  fill="#f43f5e"
                  opacity={0.5}
                  className="cursor-help"
                />
              </Tooltip>
            </g>
          );
        })}
        
        {/* Label for regression line */}
        <text
          x={scaleX((xRange[0] + xRange[1]) / 2)}
          y={scaleY((y1 + y2) / 2) - 15}
          textAnchor="middle"
          fill="#3b82f6"
          fontSize={12}
          fontWeight="bold"
          className="pointer-events-none"
        >
          ŷ = {weights.m.toFixed(3)}x + {weights.b.toFixed(3)}
        </text>
      </g>
    );
  };
  
  const theory = (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700">
      <div>
        <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-400" />
          Understanding Linear Regression
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Linear regression finds the best straight line through your data points. Think of it like 
          finding the "average trend" - if points tend to go up-right, the line goes up-right. The algorithm 
          adjusts the line's slope and position to minimize how far off it is from all the points.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
            📈 The Line Equation
          </h4>
          <p className="font-mono text-white text-lg mb-2">ŷ = mx + b</p>
          <p className="text-xs text-slate-400">
            <strong>m</strong> = slope (how steep), <strong>b</strong> = y-intercept (where it crosses y-axis)
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-rose-900/30 to-rose-800/20 border border-rose-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-rose-300 mb-2 flex items-center gap-2">
            📊 Cost Function (MSE)
          </h4>
          <p className="font-mono text-white text-sm mb-2">J = (1/n) Σ(y - ŷ)²</p>
          <p className="text-xs text-slate-400">
            Average of squared distances. Lower = better fit! We want to minimize this.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
            🎯 Gradient Descent
          </h4>
          <p className="font-mono text-white text-sm mb-2">θ := θ - α·∇J</p>
          <p className="text-xs text-slate-400">
            Move weights in direction that reduces error. Repeat until convergence.
          </p>
        </div>
      </div>
      
      <MathExplanation
        title="How Gradient Descent Works (Step by Step)"
        intuition="Imagine you're on a hill in fog and want to reach the valley (minimum error). You feel the ground's slope and take small steps downhill. That's gradient descent!"
        steps={[
          {
            text: "Start with random weights",
            formula: "m = 0, b = 0",
            explanation: "We begin with no knowledge - a horizontal line at y=0"
          },
          {
            text: "Calculate predictions for all data points",
            formula: "ŷᵢ = m·xᵢ + b",
            explanation: "Use current line equation to predict y for each x"
          },
          {
            text: "Compute the Mean Squared Error (MSE)",
            formula: "MSE = (1/n) Σ(yᵢ - ŷᵢ)²",
            explanation: "Measure how wrong our predictions are on average"
          },
          {
            text: "Calculate gradients (slopes of error)",
            formula: "∂J/∂m = (2/n)Σ(ŷᵢ - yᵢ)·xᵢ\n∂J/∂b = (2/n)Σ(ŷᵢ - yᵢ)",
            explanation: "Find which direction to move m and b to reduce error"
          },
          {
            text: "Update weights using learning rate",
            formula: "m := m - α·(∂J/∂m)\nb := b - α·(∂J/∂b)",
            explanation: "Take a small step (α) in the direction that reduces error"
          },
          {
            text: "Repeat steps 2-5 until convergence",
            explanation: "Keep adjusting until error stops decreasing significantly"
          }
        ]}
        example={[
          "Example with 1 point (2, 5):",
          "Start: m=0, b=0 → ŷ=0, error=(5-0)²=25",
          "∂J/∂m = 2·(0-5)·2 = -20",
          "∂J/∂b = 2·(0-5) = -10",
          "Update (α=0.01): m=0-0.01·(-20)=0.2, b=0-0.01·(-10)=0.1",
          "New: ŷ=0.2·2+0.1=0.5, error=(5-0.5)²=20.25",
          "Error decreased! Continue..."
        ]}
      />
    </div>
  );
  
  return (
    <AlgorithmLayout
      title="Linear Regression"
      description="Find the best-fitting straight line through data using gradient descent"
      icon={TrendingUp}
      color="from-blue-500 to-cyan-500"
      theory={theory}
    >
      {showTutorial && (
        <TutorialSystem
          tutorial={linearRegressionTutorial}
          onClose={() => setShowTutorial(false)}
          renderInteractive={(interactive) => {
            if (interactive.type === 'addPoints') {
              return <div className="text-slate-300 p-4 bg-slate-900 rounded">Click "Add Points" above to practice!</div>;
            }
            if (interactive.type === 'adjustParams') {
              return <div className="text-slate-300 p-4 bg-slate-900 rounded">Use the hyperparameter sliders to adjust!</div>;
            }
            if (interactive.type === 'animate') {
              return <div className="text-slate-300 p-4 bg-slate-900 rounded">Click Play/Pause to watch training!</div>;
            }
            return null;
          }}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-lg">Interactive Data & Regression Line</h3>
                <InfoIcon content="Click anywhere on the canvas to add data points. Watch how the regression line adjusts to fit your data. Red dashed lines show the error (residual) for each point." />
              </div>
              <div className="flex gap-2">
                <Tooltip content="Generate new random data points following a linear pattern with some noise">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPoints(generateSampleData())}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    New Data
                  </Button>
                </Tooltip>
                <Tooltip content="Remove all data points from the canvas">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPoints([])}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                </Tooltip>
                <Button size="sm" onClick={() => setShowTutorial(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <GraduationCap className="w-4 h-4 mr-1" />
                Tutorial
                </Button>
                </div>
                </div>
            <DataCanvas
              points={points}
              setPoints={setPoints}
              width={560}
              height={360}
              xLabel="Feature (X)"
              yLabel="Target (Y)"
              renderOverlay={renderRegressionLine}
            />
            
            {/* Visual Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-blue-500 rounded" style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' }} />
                <span className="text-slate-300">Regression Line (Best Fit)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="24" height="12">
                  <line x1="0" y1="6" x2="24" y2="6" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
                <span className="text-slate-300">Residuals (Errors)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400 border-2 border-white" />
                <span className="text-slate-300">Data Points</span>
              </div>
            </div>
          </div>
          
          {/* Training Controls */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 font-medium">Training Progress</span>
                  <InfoIcon content="Watch the algorithm iteratively improve the line fit. Each step adjusts m (slope) and b (intercept) to reduce the Mean Squared Error." />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-mono">
                    {currentStep}
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-xl text-slate-400 font-mono">{history.length - 1}</span>
                  <span className="text-sm text-slate-500 ml-2">iterations</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Tooltip content="Reset to the beginning of training">
                  <Button
                    onClick={() => {
                      setCurrentStep(0);
                      setIsTraining(false);
                    }}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content={isTraining ? "Pause the training animation" : "Start automatic training animation"}>
                  <Button
                    onClick={() => setIsTraining(!isTraining)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                  >
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
              onChange={(e) => {
                setCurrentStep(parseInt(e.target.value));
                setIsTraining(false);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Cost Function Visualization */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-white">Cost Function Over Time</h3>
              <InfoIcon content="This shows how the Mean Squared Error (MSE) decreases over training iterations. A smooth decrease indicates successful learning. If it plateaus, the model has converged." />
            </div>
            <div className="h-56 relative bg-slate-950/50 rounded-lg p-4">
              <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="costGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                {history.length > 1 && (() => {
                  const maxMSE = Math.max(...history.map(h => h.mse), 0.1);
                  const minMSE = Math.min(...history.map(h => h.mse));
                  const pathPoints = history.map((h, i) => {
                    const x = (i / (history.length - 1)) * 580 + 10;
                    const y = 190 - ((h.mse - minMSE) / (maxMSE - minMSE)) * 180;
                    return `${x},${y}`;
                  });
                  
                  const areaPath = `M10,190 L${pathPoints.join(' L')} L590,190 Z`;
                  const linePath = `M${pathPoints.join(' L')}`;
                  
                  const currentX = (currentStep / (history.length - 1)) * 580 + 10;
                  const currentY = 190 - ((history[currentStep]?.mse - minMSE) / (maxMSE - minMSE)) * 180;
                  
                  return (
                    <g>
                      <path d={areaPath} fill="url(#costGradient)" />
                      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={3} />
                      <circle cx={currentX} cy={currentY} r={8} fill="#3b82f6" stroke="#fff" strokeWidth={3} />
                      <line x1={currentX} y1={currentY} x2={currentX} y2={190} stroke="#3b82f6" strokeDasharray="4,4" opacity={0.5} strokeWidth={2} />
                      
                      {/* Labels */}
                      <text x={10} y={15} fill="#64748b" fontSize={11}>MSE: {maxMSE.toFixed(4)}</text>
                      <text x={10} y={195} fill="#64748b" fontSize={11}>MSE: {minMSE.toFixed(4)}</text>
                      <text x={currentX} y={currentY - 15} textAnchor="middle" fill="#3b82f6" fontSize={12} fontWeight="bold">
                        {history[currentStep]?.mse.toFixed(4)}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="space-y-6">
          {/* Dataset Info */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
              </div>
              <h4 className="text-sm font-medium text-slate-400">Dataset Overview</h4>
              <InfoIcon content="Summary of your training data. More points generally = better model, but diminishing returns." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                <div className="text-2xl font-bold text-cyan-400">{points.length}</div>
                <div className="text-xs text-slate-400 mt-1">Data Points</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                <div className="text-2xl font-bold text-blue-400">2D</div>
                <div className="text-xs text-slate-400 mt-1">Features (X, Y)</div>
              </div>
            </div>
            {points.length > 0 && (
              <div className="mt-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/30 text-xs text-blue-300">
                <strong>Data Range:</strong> X: [{Math.min(...points.map(p => p.x)).toFixed(1)}, {Math.max(...points.map(p => p.x)).toFixed(1)}], 
                Y: [{Math.min(...points.map(p => p.y)).toFixed(1)}, {Math.max(...points.map(p => p.y)).toFixed(1)}]
              </div>
            )}
          </div>
          
          <HyperparameterPanel params={params} onChange={setParams} title="Training Parameters" />
          
          <MetricsDisplay
            metrics={[
              { 
                label: 'Mean Squared Error', 
                value: currentMSE, 
                decimals: 6,
                tooltip: 'Average of squared differences between actual and predicted values. Lower is better! Close to 0 means perfect fit.'
              },
              { 
                label: 'R² Score', 
                value: rSquared, 
                decimals: 4,
                tooltip: 'Coefficient of determination. 1.0 = perfect fit, 0.0 = model explains nothing. Above 0.7 is generally good.'
              },
              { 
                label: 'Slope (m)', 
                value: weights.m, 
                decimals: 4,
                tooltip: 'How much Y changes for each unit change in X. Positive = upward trend, negative = downward trend.'
              },
              { 
                label: 'Intercept (b)', 
                value: weights.b, 
                decimals: 4,
                tooltip: 'Where the line crosses the Y-axis (when X=0). Starting point of your prediction line.'
              }
            ]}
          />
          
          <div className="space-y-3">
            <FormulaDisplay
              title="Current Model Equation"
              formula={`ŷ = ${weights.m.toFixed(4)}x + ${weights.b.toFixed(4)}`}
              highlighted
              explanation="This is your current best-fit line. Plug in any X value to predict Y!"
            />
            
            <FormulaDisplay
              title="Gradient (Slope of Error)"
              formula="∇J = [∂J/∂m, ∂J/∂b]"
              explanation="Shows which direction to move weights to reduce error. Magnitude shows how much to change."
              variables={[
                { symbol: '∂J/∂m', value: gradients.dm.toFixed(6) },
                { symbol: '∂J/∂b', value: gradients.db.toFixed(6) }
              ]}
            />
            
            <FormulaDisplay
              title="Weight Update Formula"
              formula={`θ_new = θ_old - α × ∇θ`}
              explanation="How we update weights each iteration. Learning rate (α) controls step size."
            />
          </div>
          
          {/* Gradient Visualization */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-medium text-slate-400">Gradient Magnitudes</h4>
              <InfoIcon content="Shows how strongly each weight needs to change. Larger bars = bigger adjustment needed. Bars shrink as model converges." />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">∂J/∂m (slope gradient)</span>
                  <span className="text-blue-400 font-mono font-semibold">{gradients.dm.toFixed(6)}</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(gradients.dm) * 10, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">∂J/∂b (intercept gradient)</span>
                  <span className="text-purple-400 font-mono font-semibold">{gradients.db.toFixed(6)}</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(gradients.db) * 10, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AlgorithmLayout>
  );
}