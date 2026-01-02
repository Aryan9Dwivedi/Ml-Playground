import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, Target, RotateCcw, MousePointer2, Sparkles, Database, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TutorialSystem from '@/components/shared/TutorialSystem';
import { knnTutorial } from '@/components/shared/tutorials';
import AlgorithmLayout from '@/components/shared/AlgorithmLayout';
import DataCanvas from '@/components/shared/DataCanvas';
import HyperparameterPanel from '@/components/shared/HyperparameterPanel';
import MetricsDisplay from '@/components/shared/MetricsDisplay';
import FormulaDisplay from '@/components/shared/FormulaDisplay';
import MathExplanation from '@/components/shared/MathExplanation';
import Tooltip, { InfoIcon } from '@/components/shared/Tooltip';

const generateSampleData = () => {
  const points = [];
  const clusters = [
    { cx: 2.5, cy: 7, class: 0 },
    { cx: 7, cy: 7, class: 1 },
    { cx: 5, cy: 2.5, class: 2 }
  ];
  
  clusters.forEach(cluster => {
    for (let i = 0; i < 8; i++) {
      points.push({
        x: cluster.cx + (Math.random() - 0.5) * 3,
        y: cluster.cy + (Math.random() - 0.5) * 3,
        class: cluster.class
      });
    }
  });
  
  return points;
};

export default function KNN() {
  const [points, setPoints] = useState(generateSampleData());
  const [currentClass, setCurrentClass] = useState(0);
  const [queryPoint, setQueryPoint] = useState({ x: 5, y: 5 });
  const [isDragging, setIsDragging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [params, setParams] = useState({
    k: {
      type: 'slider',
      label: 'K (Number of Neighbors)',
      value: 3,
      min: 1,
      max: 15,
      step: 1,
      decimals: 0,
      description: 'How many closest neighbors to consider. Odd numbers prevent ties!'
    },
    distance: {
      type: 'select',
      label: 'Distance Metric',
      value: 'euclidean',
      options: [
        { value: 'euclidean', label: 'Euclidean (straight line)' },
        { value: 'manhattan', label: 'Manhattan (grid path)' },
        { value: 'chebyshev', label: 'Chebyshev (chess king)' }
      ],
      description: 'How to measure distance between points'
    },
    weighted: {
      type: 'switch',
      label: 'Distance Weighted Voting',
      value: false,
      description: 'Give closer neighbors more voting power'
    }
  });
  
  const calculateDistance = useCallback((p1, p2, metric) => {
    switch (metric) {
      case 'manhattan':
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
      case 'chebyshev':
        return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
      default:
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
  }, []);
  
  const knnResult = useMemo(() => {
    const k = params.k.value;
    const metric = params.distance.value;
    const weighted = params.weighted.value;
    
    const distances = points.map((p, idx) => ({
      ...p,
      index: idx,
      distance: calculateDistance(queryPoint, p, metric)
    })).sort((a, b) => a.distance - b.distance);
    
    const neighbors = distances.slice(0, k);
    
    const votes = {};
    neighbors.forEach(n => {
      const weight = weighted ? (1 / (n.distance + 0.0001)) : 1;
      votes[n.class] = (votes[n.class] || 0) + weight;
    });
    
    const prediction = Object.entries(votes).sort(([,a], [,b]) => b - a)[0]?.[0];
    
    return {
      neighbors,
      distances: distances.slice(0, Math.min(10, distances.length)),
      votes,
      prediction: parseInt(prediction) || 0,
      allDistances: distances
    };
  }, [points, queryPoint, params, calculateDistance]);
  
  const accuracy = useMemo(() => {
    if (points.length < params.k.value + 1) return 0;
    
    let correct = 0;
    points.forEach((testPoint, testIdx) => {
      const trainPoints = points.filter((_, i) => i !== testIdx);
      const distances = trainPoints.map(p => ({
        ...p,
        distance: calculateDistance(testPoint, p, params.distance.value)
      })).sort((a, b) => a.distance - b.distance);
      
      const neighbors = distances.slice(0, params.k.value);
      const votes = {};
      neighbors.forEach(n => {
        const weight = params.weighted.value ? (1 / (n.distance + 0.0001)) : 1;
        votes[n.class] = (votes[n.class] || 0) + weight;
      });
      
      const pred = parseInt(Object.entries(votes).sort(([,a], [,b]) => b - a)[0]?.[0]) || 0;
      if (pred === testPoint.class) correct++;
    });
    
    return correct / points.length;
  }, [points, params, calculateDistance]);
  
  const renderKNNVisualization = ({ scaleX, scaleY, xRange, yRange, chartWidth, chartHeight }) => {
    const qx = scaleX(queryPoint.x);
    const qy = scaleY(queryPoint.y);
    
    const resolution = 40;
    const rects = [];
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = xRange[0] + (i / resolution) * (xRange[1] - xRange[0]);
        const y = yRange[0] + (j / resolution) * (yRange[1] - yRange[0]);
        
        const distances = points.map(p => ({
          ...p,
          distance: calculateDistance({ x, y }, p, params.distance.value)
        })).sort((a, b) => a.distance - b.distance);
        
        const neighbors = distances.slice(0, params.k.value);
        const votes = {};
        neighbors.forEach(n => {
          const weight = params.weighted.value ? (1 / (n.distance + 0.0001)) : 1;
          votes[n.class] = (votes[n.class] || 0) + weight;
        });
        
        const prediction = parseInt(Object.entries(votes).sort(([,a], [,b]) => b - a)[0]?.[0]) || 0;
        const colors = ['rgba(59, 130, 246, 0.12)', 'rgba(139, 92, 246, 0.12)', 'rgba(16, 185, 129, 0.12)'];
        
        rects.push(
          <rect
            key={`${i}-${j}`}
            x={scaleX(x)}
            y={scaleY(y + (yRange[1] - yRange[0]) / resolution)}
            width={chartWidth / resolution + 1}
            height={chartHeight / resolution + 1}
            fill={colors[prediction]}
          />
        );
      }
    }
    
    const neighborLines = knnResult.neighbors.map((n, i) => (
      <g key={`neighbor-${i}`}>
        <line
          x1={qx}
          y1={qy}
          x2={scaleX(n.x)}
          y2={scaleY(n.y)}
          stroke="#f59e0b"
          strokeWidth={3}
          strokeDasharray="6,3"
          opacity={0.7}
          style={{ filter: 'drop-shadow(0 0 2px rgba(245, 158, 11, 0.5))' }}
        />
      </g>
    ));
    
    const distanceCircles = knnResult.neighbors.map((n, i) => (
      <circle
        key={`circle-${i}`}
        cx={scaleX(n.x)}
        cy={scaleY(n.y)}
        r={14}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={2.5}
        style={{ filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))' }}
      />
    ));
    
    const maxKDist = knnResult.neighbors[knnResult.neighbors.length - 1]?.distance || 0;
    const radiusPixels = maxKDist * (chartWidth / (xRange[1] - xRange[0]));
    
    return (
      <g>
        {rects}
        {neighborLines}
        {distanceCircles}
        
        <circle
          cx={qx}
          cy={qy}
          r={radiusPixels}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={1.5}
          strokeDasharray="5,5"
          opacity={0.4}
        />
        
        <circle
          cx={qx}
          cy={qy}
          r={12}
          fill="#f59e0b"
          stroke="#fff"
          strokeWidth={3}
          style={{ cursor: 'grab', filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.8))' }}
          onMouseDown={() => setIsDragging(true)}
        />
        <text x={qx} y={qy - 22} textAnchor="middle" fill="#f59e0b" fontSize={12} fontWeight="bold" className="pointer-events-none">
          Query Point
        </text>
      </g>
    );
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const padding = 40;
    const chartWidth = 560 - padding * 2;
    const chartHeight = 360 - padding * 2;
    const x = ((px - padding) / chartWidth) * 10;
    const y = ((360 - padding - py) / chartHeight) * 10;
    setQueryPoint({ x: Math.max(0, Math.min(10, x)), y: Math.max(0, Math.min(10, y)) });
  };
  
  const classColors = ['#3b82f6', '#8b5cf6', '#10b981'];
  
  const theory = (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700">
      <div>
        <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-400" />
          Understanding K-Nearest Neighbors
        </h3>
        <p className="text-slate-300 leading-relaxed">
          KNN is like asking your K closest friends for advice. To classify a new point, we find its K nearest neighbors 
          and let them vote. The majority class wins! It's simple but powerful - no complex training needed. The algorithm 
          just memorizes the data and makes decisions based on similarity.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-emerald-300 mb-2">📏 Distance Metrics</h4>
          <p className="font-mono text-white text-xs mb-2">Euclidean: √(Δx² + Δy²)</p>
          <p className="text-xs text-slate-400">Different ways to measure "closeness" between points</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-300 mb-2">🗳️ Voting System</h4>
          <p className="font-mono text-white text-xs mb-2">Majority wins!</p>
          <p className="text-xs text-slate-400">Each neighbor votes for its class. Most votes = prediction</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-amber-300 mb-2">⚖️ Weighted Votes</h4>
          <p className="font-mono text-white text-xs mb-2">w = 1/distance</p>
          <p className="text-xs text-slate-400">Closer neighbors get more say in the decision</p>
        </div>
      </div>
      
      <MathExplanation
        title="How KNN Makes Predictions"
        intuition="Imagine you're new in town and want to know where to eat. You ask the 3 nearest people (K=3). If 2 say pizza and 1 says burgers, you go for pizza! That's exactly how KNN works - it asks nearby data points and follows the majority."
        steps={[
          {
            text: "Choose the value of K (number of neighbors)",
            formula: "K = 3 (must be odd to avoid ties)",
            explanation: "Start with K=3 or K=5. Larger K = smoother boundaries but less sensitive to local patterns"
          },
          {
            text: "Calculate distance from query point to all training points",
            formula: "d(p, q) = √((px - qx)² + (py - qy)²)",
            explanation: "Euclidean distance measures straight-line distance in feature space"
          },
          {
            text: "Sort all points by distance and select K nearest",
            explanation: "Find the K closest neighbors to your query point"
          },
          {
            text: "Count votes from these K neighbors",
            formula: "votes[class] = Σ weight_i",
            explanation: "Each neighbor votes for its class. With weighting: weight = 1/distance"
          },
          {
            text: "Predict the class with most votes",
            formula: "prediction = argmax(votes)",
            explanation: "The class with the highest vote count wins!"
          }
        ]}
        example={[
          "Query point at (5, 5), K = 3:",
          "Point A at (4, 6): distance = √2 ≈ 1.41, Class 0",
          "Point B at (6, 4): distance = √2 ≈ 1.41, Class 1",
          "Point C at (5, 7): distance = 2.00, Class 1",
          "Votes: Class 0 = 1, Class 1 = 2",
          "Prediction: Class 1 (majority wins!)",
          "",
          "With distance weighting:",
          "Weight A = 1/1.41 = 0.71",
          "Weight B = 1/1.41 = 0.71",
          "Weight C = 1/2.00 = 0.50",
          "Weighted votes: Class 0 = 0.71, Class 1 = 1.21",
          "Still Class 1, but now considers proximity"
        ]}
      />
    </div>
  );
  
  return (
    <AlgorithmLayout
      title="K-Nearest Neighbors"
      description="Instance-based learning: classify by majority vote of nearest neighbors"
      icon={Network}
      color="from-emerald-500 to-teal-500"
      theory={theory}
    >
      {showTutorial && (
        <TutorialSystem
          tutorial={knnTutorial}
          onClose={() => setShowTutorial(false)}
          renderInteractive={(interactive) => {
            if (interactive.type === 'moveQuery') {
              return <div className="text-slate-300 p-4 bg-slate-900 rounded">Drag the orange query point on the canvas!</div>;
            }
            if (interactive.type === 'adjustK') {
              return <div className="text-slate-300 p-4 bg-slate-900 rounded">Adjust the K slider in the parameters panel!</div>;
            }
            if (interactive.type === 'changeMetric') {
              return <div className="text-slate-300 p-4 bg-slate-900 rounded">Change the Distance Metric dropdown!</div>;
            }
            if (interactive.type === 'toggleWeighting') {
              return <div className="text-slate-300 p-4 bg-slate-900 rounded">Toggle "Distance Weighted Voting" switch!</div>;
            }
            return null;
          }}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-lg">Interactive KNN Classifier</h3>
                <InfoIcon content="DRAG the orange query point around! Watch how the prediction changes based on nearby neighbors. Orange dashed lines show the K nearest neighbors that are voting." />
              </div>
              <div className="flex gap-2">
                <div className="flex border border-slate-700 rounded-lg overflow-hidden">
                  {[0, 1, 2].map(c => (
                    <button
                      key={c}
                      onClick={() => setCurrentClass(c)}
                      className={`px-3 py-1.5 text-sm font-medium transition-all ${currentClass === c ? 'text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                      style={{ backgroundColor: currentClass === c ? classColors[c] : 'transparent' }}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
                <Tooltip content="Generate new random clustered data">
                  <Button size="sm" variant="outline" onClick={() => setPoints(generateSampleData())} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </Tooltip>
                <Button size="sm" onClick={() => setShowTutorial(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Tutorial
                </Button>
              </div>
            </div>
            <div 
              className="relative"
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <DataCanvas
                points={points}
                setPoints={setPoints}
                currentClass={currentClass}
                width={560}
                height={360}
                xLabel="Feature X₁"
                yLabel="Feature X₂"
                renderOverlay={renderKNNVisualization}
                pointColors={classColors}
              />
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MousePointer2 className="w-3 h-3 text-amber-400" />
                <span>Drag orange point • Click to add data • Shift+Click to move query point</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-white">Distance Calculations & Voting</h3>
              <InfoIcon content="Shows distances to all nearby points. The top K rows (highlighted) are the neighbors that get to vote. Watch how changing K affects which neighbors participate!" />
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-800 rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-900 border-b-2 border-slate-700 z-10">
                  <tr>
                    <th className="text-left py-3 px-3 text-slate-400 font-semibold">#</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        Location
                        <InfoIcon content="Coordinates of each training point in feature space" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-3 text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        Class
                        <InfoIcon content="The true label of this training point" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-3 text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        Distance
                        <InfoIcon content={`${params.distance.value} distance from query point. Sorted ascending!`} />
                      </div>
                    </th>
                    <th className="text-left py-3 px-3 text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        Vote?
                        <InfoIcon content="Only the K nearest neighbors get to vote" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {knnResult.distances.map((d, i) => {
                    const isNeighbor = i < params.k.value;
                    return (
                      <Tooltip 
                        key={i} 
                        content={`Point ${d.index + 1}: Distance = ${d.distance.toFixed(4)}\n${isNeighbor ? `✓ This point VOTES for Class ${d.class}` : '✗ Too far - does not vote'}\nVote weight: ${params.weighted.value ? (1 / (d.distance + 0.0001)).toFixed(3) : '1.0'}`}
                      >
                        <tr className={`border-b border-slate-800 transition-all cursor-help ${isNeighbor ? 'bg-gradient-to-r from-amber-500/15 to-amber-500/5 hover:from-amber-500/25 hover:to-amber-500/10' : 'hover:bg-slate-800/50'}`}>
                          <td className="py-2.5 px-3 text-slate-500 font-mono font-semibold">{i + 1}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-200 text-xs font-semibold">
                            ({d.x.toFixed(2)}, {d.y.toFixed(2)})
                          </td>
                          <td className="py-2.5 px-3">
                            <span 
                              className="px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm"
                              style={{ backgroundColor: classColors[d.class] + '33', color: classColors[d.class], border: `2px solid ${classColors[d.class]}` }}
                            >
                              Class {d.class}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-slate-200 font-bold bg-slate-800/50 px-2 py-1 rounded">
                              {d.distance.toFixed(4)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {isNeighbor && <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/30">
                              ✓ K={i + 1}
                            </span>}
                          </td>
                        </tr>
                      </Tooltip>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Dataset Info */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-medium text-slate-400">Dataset Overview</h4>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                <div className="text-xl font-bold text-emerald-400">{points.length}</div>
                <div className="text-xs text-slate-400 mt-1">Points</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                <div className="text-xl font-bold text-blue-400">3</div>
                <div className="text-xs text-slate-400 mt-1">Classes</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                <div className="text-xl font-bold text-purple-400">2D</div>
                <div className="text-xs text-slate-400 mt-1">Features</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {[0, 1, 2].map(cls => {
                const count = points.filter(p => p.class === cls).length;
                return (
                  <div key={cls} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: classColors[cls] }} />
                      <span className="text-slate-300">Class {cls}</span>
                    </div>
                    <span className="font-mono font-semibold" style={{ color: classColors[cls] }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <HyperparameterPanel params={params} onChange={setParams} title="Algorithm Parameters" />
          
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-medium text-slate-400">Query Point Location</h4>
              <InfoIcon content="Manually adjust the query point coordinates or drag it on the canvas." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">X Coordinate</label>
                <input
                  type="number"
                  value={queryPoint.x.toFixed(2)}
                  onChange={(e) => setQueryPoint({ ...queryPoint, x: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  step="0.1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Y Coordinate</label>
                <input
                  type="number"
                  value={queryPoint.y.toFixed(2)}
                  onChange={(e) => setQueryPoint({ ...queryPoint, y: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  step="0.1"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-sm font-medium text-slate-400">Voting Results</h4>
              <InfoIcon content="Each neighbor casts a vote for its class. The class with the most votes (or highest weighted sum) wins!" />
            </div>
            <div className="space-y-3">
              {Object.entries(knnResult.votes).sort(([,a], [,b]) => b - a).map(([cls, votes]) => (
                <div key={cls}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Class {cls}</span>
                    <span className="font-mono font-bold" style={{ color: classColors[parseInt(cls)] }}>
                      {params.weighted.value ? votes.toFixed(2) : votes} {params.weighted.value ? 'weighted' : 'votes'}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: classColors[parseInt(cls)] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(votes / Math.max(...Object.values(knnResult.votes))) * 100}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/30">
                <span className="text-slate-300 font-medium">Final Prediction:</span>
                <span 
                  className="px-4 py-1.5 rounded-lg font-bold text-lg shadow-lg"
                  style={{ 
                    backgroundColor: classColors[knnResult.prediction] + '33', 
                    color: classColors[knnResult.prediction],
                    border: `2px solid ${classColors[knnResult.prediction]}`
                  }}
                >
                  Class {knnResult.prediction}
                </span>
              </div>
            </div>
          </div>
          
          <MetricsDisplay
            metrics={[
              { label: 'LOO Accuracy', value: accuracy * 100, decimals: 1, description: '%', tooltip: 'Leave-One-Out Cross-Validation accuracy. Tests how well the model generalizes by leaving out each point and predicting it.' },
              { label: 'K Value', value: params.k.value, decimals: 0, tooltip: 'Number of neighbors voting. Small K = sensitive to noise, large K = smoother decisions.' },
              { label: 'Total Points', value: points.length, decimals: 0, tooltip: 'Number of training data points in the dataset.' },
              { label: 'Max Distance (K)', value: knnResult.neighbors[knnResult.neighbors.length - 1]?.distance || 0, decimals: 3, tooltip: 'Distance to the furthest neighbor in the K set. Defines the voting radius.' }
            ]}
          />
          
          <FormulaDisplay
            title={`${params.distance.value.charAt(0).toUpperCase() + params.distance.value.slice(1)} Distance`}
            formula={
              params.distance.value === 'euclidean' ? 'd = √((x₁-x₂)² + (y₁-y₂)²)' :
              params.distance.value === 'manhattan' ? 'd = |x₁-x₂| + |y₁-y₂|' :
              'd = max(|x₁-x₂|, |y₁-y₂|)'
            }
            explanation={
              params.distance.value === 'euclidean' ? 'Straight-line distance (as the crow flies)' :
              params.distance.value === 'manhattan' ? 'Grid-based distance (like city blocks)' :
              'Maximum distance along any axis (like chess king moves)'
            }
          />
        </div>
      </div>
    </AlgorithmLayout>
  );
}