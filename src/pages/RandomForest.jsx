import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, RotateCcw, TreeDeciduous, Sparkles, Eye, EyeOff, BarChart3, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TutorialSystem from '@/components/shared/TutorialSystem';
import { randomForestTutorial } from '@/components/shared/tutorials';
import AlgorithmLayout from '@/components/shared/AlgorithmLayout';
import HyperparameterPanel from '@/components/shared/HyperparameterPanel';
import MetricsDisplay from '@/components/shared/MetricsDisplay';
import FormulaDisplay from '@/components/shared/FormulaDisplay';
import MathExplanation from '@/components/shared/MathExplanation';
import Tooltip, { InfoIcon } from '@/components/shared/Tooltip';

const generateSampleData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    const x1 = Math.random() * 10;
    const x2 = Math.random() * 10;
    let cls;
    if (x1 + x2 < 8) cls = 0;
    else if (x1 > x2) cls = 1;
    else cls = 2;
    if (Math.random() < 0.1) cls = Math.floor(Math.random() * 3);
    data.push({ x1, x2, class: cls });
  }
  return data;
};

const calculateGini = (data) => {
  if (data.length === 0) return 0;
  const counts = {};
  data.forEach(d => { counts[d.class] = (counts[d.class] || 0) + 1; });
  let gini = 1;
  Object.values(counts).forEach(count => { const p = count / data.length; gini -= p * p; });
  return gini;
};

const getMajorityClass = (data) => {
  const counts = {};
  data.forEach(d => { counts[d.class] = (counts[d.class] || 0) + 1; });
  return parseInt(Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0]) || 0;
};

export default function RandomForest() {
  const [data, setData] = useState(generateSampleData());
  const [params, setParams] = useState({
    nTrees: {
      type: 'slider',
      label: 'Number of Trees',
      value: 7,
      min: 1,
      max: 20,
      step: 1,
      decimals: 0,
      description: 'More trees = better predictions but slower. Typically 50-500 in practice!'
    },
    maxDepth: {
      type: 'slider',
      label: 'Max Tree Depth',
      value: 3,
      min: 1,
      max: 5,
      step: 1,
      decimals: 0,
      description: 'How deep each tree can grow. Deeper = more complex patterns.'
    },
    sampleRatio: {
      type: 'slider',
      label: 'Bootstrap Sample %',
      value: 0.7,
      min: 0.3,
      max: 1,
      step: 0.1,
      decimals: 1,
      description: 'Percentage of data each tree sees. Typical: 60-80%'
    },
    featureRatio: {
      type: 'slider',
      label: 'Feature Sampling %',
      value: 1.0,
      min: 0.3,
      max: 1,
      step: 0.1,
      decimals: 1,
      description: 'What % of features to consider at each split. Lower = more diversity.'
    }
  });
  
  const [selectedTree, setSelectedTree] = useState(0);
  const [showComparison, setShowComparison] = useState(true);
  const [highlightOOB, setHighlightOOB] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const buildTree = useCallback((trainData, maxDepth, features) => {
    const build = (nodeData, depth) => {
      const gini = calculateGini(nodeData);
      const majorityClass = getMajorityClass(nodeData);
      if (depth >= maxDepth || nodeData.length < 2 || gini === 0) {
        return { isLeaf: true, prediction: majorityClass, samples: nodeData.length, gini };
      }
      let bestGain = 0;
      let bestSplit = null;
      features.forEach(feature => {
        const values = [...new Set(nodeData.map(d => d[feature]))].sort((a, b) => a - b);
        for (let i = 0; i < values.length - 1; i++) {
          const threshold = (values[i] + values[i + 1]) / 2;
          const left = nodeData.filter(d => d[feature] <= threshold);
          const right = nodeData.filter(d => d[feature] > threshold);
          if (left.length === 0 || right.length === 0) continue;
          const weightedGini = (left.length * calculateGini(left) + right.length * calculateGini(right)) / nodeData.length;
          const gain = gini - weightedGini;
          if (gain > bestGain) {
            bestGain = gain;
            bestSplit = { feature, threshold, left, right };
          }
        }
      });
      if (!bestSplit) return { isLeaf: true, prediction: majorityClass, samples: nodeData.length, gini };
      return {
        isLeaf: false,
        feature: bestSplit.feature,
        threshold: bestSplit.threshold,
        samples: nodeData.length,
        gini,
        gain: bestGain,
        left: build(bestSplit.left, depth + 1),
        right: build(bestSplit.right, depth + 1)
      };
    };
    return build(trainData, 0);
  }, []);
  
  const forest = useMemo(() => {
    const trees = [];
    const features = ['x1', 'x2'];
    for (let t = 0; t < params.nTrees.value; t++) {
      const sampleSize = Math.floor(data.length * params.sampleRatio.value);
      const indices = new Set();
      const trainData = [];
      for (let i = 0; i < sampleSize; i++) {
        const idx = Math.floor(Math.random() * data.length);
        indices.add(idx);
        trainData.push(data[idx]);
      }
      const oobIndices = data.map((_, i) => i).filter(i => !indices.has(i));
      const nFeatures = Math.max(1, Math.floor(features.length * params.featureRatio.value));
      const selectedFeatures = features.sort(() => Math.random() - 0.5).slice(0, nFeatures);
      const tree = buildTree(trainData, params.maxDepth.value, selectedFeatures);
      trees.push({ tree, trainIndices: [...indices], oobIndices, features: selectedFeatures, sampleSize: trainData.length });
    }
    return trees;
  }, [data, params, buildTree]);
  
  const predict = useCallback((tree, point) => {
    if (tree.isLeaf) return tree.prediction;
    if (point[tree.feature] <= tree.threshold) return predict(tree.left, point);
    return predict(tree.right, point);
  }, []);
  
  const ensemblePredict = useCallback((point) => {
    const votes = {};
    forest.forEach(({ tree }) => {
      const pred = predict(tree, point);
      votes[pred] = (votes[pred] || 0) + 1;
    });
    return parseInt(Object.entries(votes).sort(([,a], [,b]) => b - a)[0][0]);
  }, [forest, predict]);
  
  const accuracy = useMemo(() => {
    let correct = 0;
    data.forEach(d => { if (ensemblePredict(d) === d.class) correct++; });
    return correct / data.length;
  }, [data, ensemblePredict]);
  
  const oobError = useMemo(() => {
    let correct = 0, total = 0;
    data.forEach((d, i) => {
      const oobTrees = forest.filter(f => f.oobIndices.includes(i));
      if (oobTrees.length === 0) return;
      const votes = {};
      oobTrees.forEach(({ tree }) => {
        const pred = predict(tree, d);
        votes[pred] = (votes[pred] || 0) + 1;
      });
      const pred = parseInt(Object.entries(votes).sort(([,a], [,b]) => b - a)[0][0]);
      if (pred === d.class) correct++;
      total++;
    });
    return total > 0 ? 1 - (correct / total) : 0;
  }, [data, forest, predict]);
  
  const featureImportance = useMemo(() => {
    const importance = { x1: 0, x2: 0 };
    let totalGain = 0;
    const traverse = (node) => {
      if (node.isLeaf) return;
      importance[node.feature] += node.gain * node.samples;
      totalGain += node.gain * node.samples;
      traverse(node.left);
      traverse(node.right);
    };
    forest.forEach(({ tree }) => traverse(tree));
    if (totalGain > 0) {
      importance.x1 /= totalGain;
      importance.x2 /= totalGain;
    }
    return importance;
  }, [forest]);
  
  const classColors = ['#06b6d4', '#8b5cf6', '#10b981'];
  
  const MiniTree = ({ tree, index, selected, onClick }) => {
    const countNodes = (node) => {
      if (!node || node.isLeaf) return 1;
      return 1 + countNodes(node.left) + countNodes(node.right);
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.03 }}
        onClick={() => onClick(index)}
        className={`p-3 rounded-xl cursor-pointer transition-all ${
          selected 
            ? 'bg-gradient-to-br from-rose-600/20 to-pink-600/20 border-2 border-rose-500 shadow-lg shadow-rose-500/20' 
            : 'bg-slate-900/80 border border-slate-700 hover:border-slate-600 hover:shadow-lg'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <TreeDeciduous className={`w-4 h-4 ${selected ? 'text-rose-400' : 'text-slate-400'}`} />
          <span className="text-sm font-semibold text-white">Tree {index + 1}</span>
          {selected && <Sparkles className="w-3 h-3 text-rose-400 ml-auto" />}
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex justify-between"><span>Nodes:</span><span className="text-white font-mono">{countNodes(tree.tree)}</span></div>
          <div className="flex justify-between"><span>Samples:</span><span className="text-white font-mono">{tree.sampleSize}</span></div>
          <div className="flex justify-between"><span>Features:</span><span className="text-emerald-400 font-mono text-xs">{tree.features.join(', ')}</span></div>
        </div>
      </motion.div>
    );
  };
  
  const theory = (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700">
      <div>
        <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-rose-400" />
          Understanding Random Forests
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Random Forest is like asking many experts (trees) and combining their opinions! Each tree sees a random subset of data 
          (bootstrap sampling) and random features, making them diverse. When predicting, all trees vote and the majority wins. 
          This "wisdom of crowds" makes Random Forest more accurate and stable than a single decision tree.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-rose-900/30 to-rose-800/20 border border-rose-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-rose-300 mb-2">🎲 Bootstrap Sampling (Bagging)</h4>
          <p className="text-xs text-slate-300 mb-2">Each tree trains on a random subset sampled WITH replacement</p>
          <p className="text-xs text-slate-400">Same point can appear multiple times. Creates diversity!</p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-pink-300 mb-2">🌳 Feature Randomness</h4>
          <p className="text-xs text-slate-300 mb-2">Each split considers only a random subset of features</p>
          <p className="text-xs text-slate-400">Prevents trees from being too similar. Typical: √n features</p>
        </div>
      </div>
      
      <MathExplanation
        title="How Random Forest Works: Ensemble Magic"
        intuition="Imagine you're moving to a new city and ask 100 random locals where to eat (instead of just 1 person). Even if some give bad advice, the majority opinion is usually right! That's Random Forest - many diverse predictors voting together."
        steps={[
          {
            text: "Create N bootstrap samples from training data",
            formula: "Sample_i = random_sample_with_replacement(Data, size=0.7×|Data|)",
            explanation: "Each tree gets a different random subset. About 63% unique, 37% duplicates on average"
          },
          {
            text: "For each bootstrap sample, build a decision tree",
            explanation: "But with a twist - at each split, only consider a random subset of features"
          },
          {
            text: "At each node split, randomly select m features to consider",
            formula: "m = √(total_features)  OR  m = log₂(total_features)",
            explanation: "This creates diversity - trees can't all pick the same strongest feature"
          },
          {
            text: "Split on the best feature among the m random features",
            explanation: "Use Gini or entropy to find best split, but only from the random subset"
          },
          {
            text: "Repeat for all N trees in the forest",
            explanation: "Each tree is trained independently with its own random data and features"
          },
          {
            text: "For prediction, all trees vote and majority wins",
            formula: "Final_Prediction = mode(Tree₁(x), Tree₂(x), ..., Tree_N(x))",
            explanation: "Classification: majority vote. Regression: average of predictions"
          }
        ]}
        example={[
          "Example with 3 trees predicting for point (5.2, 7.8):",
          "",
          "Tree 1 (trained on 70 samples, features [x1, x2]):",
          "  → Predicts Class 1",
          "",
          "Tree 2 (trained on 68 samples, features [x1]):",
          "  → Predicts Class 1",
          "",
          "Tree 3 (trained on 72 samples, features [x2]):",
          "  → Predicts Class 2",
          "",
          "Vote Count: Class 1 = 2, Class 2 = 1",
          "Final Prediction: Class 1 (majority wins!) ✓",
          "",
          "Why it works:",
          "• Each tree makes mistakes in different areas",
          "• Errors cancel out through voting",
          "• Ensemble is more robust than any single tree"
        ]}
      />
    </div>
  );
  
  return (
    <AlgorithmLayout
      title="Random Forest"
      description="Ensemble of decision trees using bootstrap aggregating and random feature selection"
      icon={Layers}
      color="from-rose-500 to-pink-500"
      theory={theory}
    >
      {showTutorial && <TutorialSystem tutorial={randomForestTutorial} onClose={() => setShowTutorial(false)} renderInteractive={() => <div className="text-slate-300 p-4 bg-slate-900 rounded">Click individual trees to compare!</div>} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Data Distribution Visualization */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rose-400" />
                <h3 className="font-semibold text-white text-lg">Training Data Distribution</h3>
                <InfoIcon content="Shows the actual data the forest is learning from. Each colored region represents a class. Hover over points to see details!" />
              </div>
              <div className="flex gap-2">
                <Tooltip content="Highlight out-of-bag samples (not used by selected tree)">
                  <Button size="sm" variant="outline" onClick={() => setHighlightOOB(!highlightOOB)} className={`border-slate-700 ${highlightOOB ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300'}`}>
                    {highlightOOB ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="ml-1 text-xs">OOB</span>
                  </Button>
                </Tooltip>
                <Tooltip content="Generate new random data">
                  <Button size="sm" variant="outline" onClick={() => setData(generateSampleData())} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    New Data
                  </Button>
                  </Tooltip>
                  <Button size="sm" onClick={() => setShowTutorial(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Tutorial
                  </Button>
                  </div>
                  </div>
            
            <svg width={560} height={280} className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-slate-800">
              {data.map((d, i) => {
                const isOOB = highlightOOB && forest[selectedTree]?.oobIndices.includes(i);
                return (
                  <Tooltip key={i} content={`Point ${i + 1}: (${d.x1.toFixed(2)}, ${d.x2.toFixed(2)})\nClass: ${d.class}\n${isOOB ? '⚠️ Out-of-Bag for Tree ' + (selectedTree + 1) : '✓ In training set'}`}>
                    <circle
                      cx={30 + (d.x1 / 10) * 500}
                      cy={250 - (d.x2 / 10) * 220}
                      r={isOOB ? 6 : 4}
                      fill={classColors[d.class]}
                      stroke={isOOB ? '#f59e0b' : '#fff'}
                      strokeWidth={isOOB ? 3 : 1.5}
                      opacity={isOOB ? 1 : 0.8}
                      className="transition-all cursor-help"
                      style={{ filter: isOOB ? 'drop-shadow(0 0 4px #f59e0b)' : 'none' }}
                    />
                  </Tooltip>
                );
              })}
              <line x1={30} y1={250} x2={530} y2={250} stroke="#475569" strokeWidth={2} />
              <line x1={30} y1={30} x2={30} y2={250} stroke="#475569" strokeWidth={2} />
              <text x={280} y={270} textAnchor="middle" fill="#64748b" fontSize={12}>Feature X₁</text>
              <text x={15} y={140} textAnchor="middle" fill="#64748b" fontSize={12} transform="rotate(-90, 15, 140)">Feature X₂</text>
              
              {/* Class distribution bars */}
              <g>
                {[0, 1, 2].map((cls, i) => {
                  const count = data.filter(d => d.class === cls).length;
                  return (
                    <g key={cls}>
                      <rect x={540} y={30 + i * 70} width={15} height={(count / data.length) * 60} fill={classColors[cls]} rx={2} />
                      <text x={545} y={100 + i * 70} textAnchor="middle" fill={classColors[cls]} fontSize={10} fontWeight="bold">{count}</text>
                    </g>
                  );
                })}
              </g>
            </svg>
            
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex gap-4">
                {classColors.map((color, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-slate-300">Class {i}: {data.filter(d => d.class === i).length} samples</span>
                  </div>
                ))}
              </div>
              <span className="text-slate-500">Total: {data.length} points</span>
            </div>
          </div>
          
          {/* Forest Overview */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-lg">Forest Ensemble ({params.nTrees.value} trees)</h3>
                <InfoIcon content="Click any tree to inspect it! Each tree is trained on different data and makes slightly different decisions." />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {forest.map((f, i) => (
                <MiniTree key={i} tree={f} index={i} selected={selectedTree === i} onClick={setSelectedTree} />
              ))}
            </div>
          </div>
          
          {/* Decision Boundary Comparison */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-lg">Decision Boundaries</h3>
                <InfoIcon content="LEFT: Single tree (noisy, overfit). RIGHT: Full ensemble (smooth, generalized). See how voting reduces overfitting!" />
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowComparison(!showComparison)} className="text-slate-400 hover:text-white">
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Button>
            </div>
            
            {showComparison && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-2 font-semibold flex items-center gap-2">
                    <TreeDeciduous className="w-3 h-3" />
                    Tree {selectedTree + 1} Only (Individual)
                  </div>
                  <svg width="100%" height={220} viewBox="0 0 280 220" className="bg-slate-950 rounded-lg border border-slate-800">
                    {(() => {
                      const resolution = 35;
                      const rects = [];
                      const tree = forest[selectedTree]?.tree;
                      if (!tree) return null;
                      for (let i = 0; i < resolution; i++) {
                        for (let j = 0; j < resolution; j++) {
                          const x1 = (i / resolution) * 10;
                          const x2 = (j / resolution) * 10;
                          const cls = predict(tree, { x1, x2 });
                          rects.push(<rect key={`${i}-${j}`} x={20 + (i / resolution) * 240} y={200 - (j / resolution) * 180} width={240 / resolution + 1} height={180 / resolution + 1} fill={classColors[cls] + '55'} />);
                        }
                      }
                      return rects;
                    })()}
                    {data.map((d, i) => <circle key={i} cx={20 + (d.x1 / 10) * 240} cy={200 - (d.x2 / 10) * 180} r={2.5} fill={classColors[d.class]} stroke="#fff" strokeWidth={1} />)}
                  </svg>
                </div>
                
                <div>
                  <div className="text-xs text-slate-400 mb-2 font-semibold flex items-center gap-2">
                    <Layers className="w-3 h-3" />
                    Full Ensemble (All {params.nTrees.value} Trees Voting)
                  </div>
                  <svg width="100%" height={220} viewBox="0 0 280 220" className="bg-slate-950 rounded-lg border border-slate-800">
                    {(() => {
                      const resolution = 35;
                      const rects = [];
                      for (let i = 0; i < resolution; i++) {
                        for (let j = 0; j < resolution; j++) {
                          const x1 = (i / resolution) * 10;
                          const x2 = (j / resolution) * 10;
                          const cls = ensemblePredict({ x1, x2 });
                          rects.push(<rect key={`${i}-${j}`} x={20 + (i / resolution) * 240} y={200 - (j / resolution) * 180} width={240 / resolution + 1} height={180 / resolution + 1} fill={classColors[cls] + '55'} />);
                        }
                      }
                      return rects;
                    })()}
                    {data.map((d, i) => <circle key={i} cx={20 + (d.x1 / 10) * 240} cy={200 - (d.x2 / 10) * 180} r={2.5} fill={classColors[d.class]} stroke="#fff" strokeWidth={1} />)}
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          {/* Feature Importance */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-white text-lg">Feature Importance</h3>
              <InfoIcon content="Shows which features contribute most to predictions. Based on how much each feature reduces impurity across all splits in all trees." />
            </div>
            <div className="space-y-4">
              {Object.entries(featureImportance).sort(([,a], [,b]) => b - a).map(([feature, imp]) => (
                <div key={feature}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-semibold">{feature}</span>
                    <span className="text-rose-400 font-mono font-bold">{(imp * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <motion.div
                      className="h-full bg-gradient-to-r from-rose-600 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${imp * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {imp > 0.6 ? '🔥 Highly influential' : imp > 0.4 ? '✓ Important' : '- Less important'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <HyperparameterPanel params={params} onChange={setParams} title="Forest Configuration" />
          
          <MetricsDisplay
            metrics={[
              { label: 'Ensemble Accuracy', value: accuracy * 100, decimals: 1, description: '%', tooltip: 'How many points the full forest classifies correctly. Higher = better generalization.' },
              { label: 'OOB Error', value: oobError * 100, decimals: 1, description: '%', tooltip: 'Out-of-Bag error: validation on data each tree did NOT see. Lower = better. Like free cross-validation!' },
              { label: 'Total Trees', value: params.nTrees.value, decimals: 0, tooltip: 'Number of decision trees in the ensemble. More trees = more stable but slower.' },
              { label: 'Avg Samples/Tree', value: Math.floor(data.length * params.sampleRatio.value), decimals: 0, tooltip: 'Average training samples per tree due to bootstrap sampling.' }
            ]}
          />
          
          <div className="space-y-3">
            <FormulaDisplay
              title="Ensemble Prediction"
              formula="ŷ = mode(T₁(x), T₂(x), ..., Tₙ(x))"
              explanation="Majority vote from all trees. Most common prediction wins!"
              variables={[
                { symbol: 'Tᵢ(x)', value: 'Prediction from tree i' },
                { symbol: 'mode', value: 'Most frequent value' }
              ]}
            />
            
            <FormulaDisplay
              title="Out-of-Bag (OOB) Validation"
              formula="OOB_error = 1 - (correct_OOB / total_OOB)"
              explanation="Free validation! Each point is predicted by trees that didn't see it during training (~37% of trees)."
            />
          </div>
          
          {forest[selectedTree] && (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-lg">
              <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <TreeDeciduous className="w-4 h-4 text-rose-400" />
                Tree {selectedTree + 1} Details
              </h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500">Bootstrap samples:</span>
                  <span className="text-white font-mono">{forest[selectedTree].sampleSize}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500">OOB samples:</span>
                  <span className="text-amber-400 font-mono">{forest[selectedTree].oobIndices.length}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500">Features used:</span>
                  <span className="text-emerald-400 font-mono text-xs">{forest[selectedTree].features.join(', ')}</span>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-xs text-blue-300">
                    💡 This tree only saw {((forest[selectedTree].sampleSize / data.length) * 100).toFixed(0)}% of the data and {((forest[selectedTree].features.length / 2) * 100).toFixed(0)}% of features!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-lg">
            <h4 className="text-sm font-medium text-slate-400 mb-3">🎓 Why Random Forest Works</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <strong className="text-emerald-400">Diversity:</strong> Each tree sees different data and features, so they make different mistakes
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <strong className="text-blue-400">Wisdom of Crowds:</strong> Individual trees might overfit, but voting averages out errors
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <strong className="text-purple-400">Reduced Variance:</strong> Ensemble is more stable than any single tree
              </div>
            </div>
          </div>
        </div>
      </div>
    </AlgorithmLayout>
  );
}