import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TreeDeciduous, RotateCcw, Sparkles, ChevronDown, ChevronUp, Database, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TutorialSystem from '@/components/shared/TutorialSystem';
import { decisionTreeTutorial } from '@/components/shared/tutorials';
import AlgorithmLayout from '@/components/shared/AlgorithmLayout';
import HyperparameterPanel from '@/components/shared/HyperparameterPanel';
import MetricsDisplay from '@/components/shared/MetricsDisplay';
import FormulaDisplay from '@/components/shared/FormulaDisplay';
import MathExplanation from '@/components/shared/MathExplanation';
import Tooltip, { InfoIcon } from '@/components/shared/Tooltip';

const generateSampleData = () => {
  const data = [];
  for (let i = 0; i < 40; i++) {
    const x1 = Math.random() * 10;
    const x2 = Math.random() * 10;
    let cls;
    if (x1 < 5 && x2 < 5) cls = 0;
    else if (x1 >= 5) cls = 1;
    else cls = 2;
    if (Math.random() < 0.1) cls = Math.floor(Math.random() * 3);
    data.push({ x1, x2, class: cls });
  }
  return data;
};

const calculateEntropy = (data) => {
  if (data.length === 0) return 0;
  const counts = {};
  data.forEach(d => { counts[d.class] = (counts[d.class] || 0) + 1; });
  let entropy = 0;
  Object.values(counts).forEach(count => {
    const p = count / data.length;
    if (p > 0) entropy -= p * Math.log2(p);
  });
  return entropy;
};

const calculateGini = (data) => {
  if (data.length === 0) return 0;
  const counts = {};
  data.forEach(d => { counts[d.class] = (counts[d.class] || 0) + 1; });
  let gini = 1;
  Object.values(counts).forEach(count => {
    const p = count / data.length;
    gini -= p * p;
  });
  return gini;
};

const getMajorityClass = (data) => {
  const counts = {};
  data.forEach(d => { counts[d.class] = (counts[d.class] || 0) + 1; });
  return parseInt(Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0]) || 0;
};

export default function DecisionTree() {
  const [data, setData] = useState(generateSampleData());
  const [params, setParams] = useState({
    maxDepth: {
      type: 'slider',
      label: 'Max Depth',
      value: 3,
      min: 1,
      max: 6,
      step: 1,
      decimals: 0,
      description: 'Maximum depth of the tree. Deeper = more complex decisions but risk of overfitting.'
    },
    minSamples: {
      type: 'slider',
      label: 'Min Samples Split',
      value: 2,
      min: 2,
      max: 10,
      step: 1,
      decimals: 0,
      description: 'Minimum data points needed to split a node. Higher = simpler tree.'
    },
    criterion: {
      type: 'select',
      label: 'Split Criterion',
      value: 'entropy',
      options: [
        { value: 'entropy', label: 'Entropy (Information Gain)' },
        { value: 'gini', label: 'Gini Impurity' }
      ],
      description: 'Metric to measure quality of a split'
    }
  });
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const impurityFn = params.criterion.value === 'entropy' ? calculateEntropy : calculateGini;
  
  const buildTree = useCallback((nodeData, depth, nodeId) => {
    const impurity = impurityFn(nodeData);
    const majorityClass = getMajorityClass(nodeData);
    
    if (depth >= params.maxDepth.value || nodeData.length < params.minSamples.value || impurity === 0) {
      return {
        id: nodeId,
        isLeaf: true,
        samples: nodeData.length,
        impurity,
        prediction: majorityClass,
        classCounts: nodeData.reduce((acc, d) => { acc[d.class] = (acc[d.class] || 0) + 1; return acc; }, {}),
        depth
      };
    }
    
    let bestGain = -Infinity;
    let bestSplit = null;
    
    ['x1', 'x2'].forEach(feature => {
      const values = [...new Set(nodeData.map(d => d[feature]))].sort((a, b) => a - b);
      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2;
        const left = nodeData.filter(d => d[feature] <= threshold);
        const right = nodeData.filter(d => d[feature] > threshold);
        if (left.length === 0 || right.length === 0) continue;
        const leftImpurity = impurityFn(left);
        const rightImpurity = impurityFn(right);
        const weightedImpurity = (left.length * leftImpurity + right.length * rightImpurity) / nodeData.length;
        const gain = impurity - weightedImpurity;
        if (gain > bestGain) {
          bestGain = gain;
          bestSplit = { feature, threshold, left, right, leftImpurity, rightImpurity };
        }
      }
    });
    
    if (!bestSplit || bestGain <= 0) {
      return {
        id: nodeId,
        isLeaf: true,
        samples: nodeData.length,
        impurity,
        prediction: majorityClass,
        classCounts: nodeData.reduce((acc, d) => { acc[d.class] = (acc[d.class] || 0) + 1; return acc; }, {}),
        depth
      };
    }
    
    return {
      id: nodeId,
      isLeaf: false,
      feature: bestSplit.feature,
      threshold: bestSplit.threshold,
      samples: nodeData.length,
      impurity,
      informationGain: bestGain,
      classCounts: nodeData.reduce((acc, d) => { acc[d.class] = (acc[d.class] || 0) + 1; return acc; }, {}),
      depth,
      left: buildTree(bestSplit.left, depth + 1, `${nodeId}-L`),
      right: buildTree(bestSplit.right, depth + 1, `${nodeId}-R`)
    };
  }, [params, impurityFn]);
  
  const tree = useMemo(() => buildTree(data, 0, 'root'), [data, buildTree]);
  
  const countNodes = (node) => {
    if (!node) return { total: 0, leaves: 0 };
    if (node.isLeaf) return { total: 1, leaves: 1 };
    const left = countNodes(node.left);
    const right = countNodes(node.right);
    return { total: 1 + left.total + right.total, leaves: left.leaves + right.leaves };
  };
  
  const nodeStats = countNodes(tree);
  
  const accuracy = useMemo(() => {
    const predict = (node, point) => {
      if (node.isLeaf) return node.prediction;
      if (point[node.feature] <= node.threshold) return predict(node.left, point);
      return predict(node.right, point);
    };
    let correct = 0;
    data.forEach(d => { if (predict(tree, d) === d.class) correct++; });
    return correct / data.length;
  }, [tree, data]);
  
  const classColors = ['#06b6d4', '#8b5cf6', '#10b981'];
  
  const TreeNode = ({ node, x, y, parentX, parentY, level, maxWidth }) => {
    if (!node) return null;
    const isSelected = selectedNode?.id === node.id;
    const nodeWidth = 170;
    const levelHeight = 110;
    const childSpacing = maxWidth / Math.pow(2, level + 1);
    
    return (
      <g>
        {parentX !== undefined && (
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            x1={parentX}
            y1={parentY + 35}
            x2={x}
            y2={y}
            stroke="#475569"
            strokeWidth={2.5}
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
          />
        )}
        
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: level * 0.15 }}
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedNode(node)}
        >
          <rect
            x={x - nodeWidth / 2}
            y={y}
            width={nodeWidth}
            height={70}
            rx={10}
            fill={isSelected ? '#1e3a5f' : node.isLeaf ? '#1a2942' : '#1e293b'}
            stroke={isSelected ? '#3b82f6' : '#334155'}
            strokeWidth={isSelected ? 3 : 1.5}
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
          />
          
          {node.isLeaf ? (
            <>
              <rect x={x - nodeWidth / 2 + 6} y={y + 6} width={nodeWidth - 12} height={24} rx={6} fill={classColors[node.prediction] + '33'} />
              <text x={x} y={y + 22} textAnchor="middle" fill={classColors[node.prediction]} fontSize={12} fontWeight="bold">
                ✓ Predict: Class {node.prediction}
              </text>
              <text x={x} y={y + 42} textAnchor="middle" fill="#94a3b8" fontSize={11}>
                📊 Samples: {node.samples}
              </text>
              <text x={x} y={y + 60} textAnchor="middle" fill="#64748b" fontSize={10}>
                {params.criterion.value}: {node.impurity.toFixed(3)}
              </text>
            </>
          ) : (
            <>
              <text x={x} y={y + 20} textAnchor="middle" fill="#e2e8f0" fontSize={12} fontWeight="bold">
                {node.feature} ≤ {node.threshold.toFixed(2)}
              </text>
              <text x={x} y={y + 38} textAnchor="middle" fill="#94a3b8" fontSize={10}>
                📊 {node.samples} samples
              </text>
              <text x={x} y={y + 52} textAnchor="middle" fill="#10b981" fontSize={10}>
                ⬆ Gain: {node.informationGain?.toFixed(3)}
              </text>
              <text x={x} y={y + 65} textAnchor="middle" fill="#64748b" fontSize={9}>
                {params.criterion.value}: {node.impurity.toFixed(3)}
              </text>
            </>
          )}
          
          <g>
            {Object.entries(node.classCounts || {}).map(([cls, count], i, arr) => {
              const prevWidth = arr.slice(0, i).reduce((sum, [, c]) => sum + (c / node.samples) * (nodeWidth - 12), 0);
              return (
                <rect
                  key={cls}
                  x={x - nodeWidth / 2 + 6 + prevWidth}
                  y={y + 66}
                  width={(count / node.samples) * (nodeWidth - 12)}
                  height={3}
                  fill={classColors[parseInt(cls)]}
                  rx={1.5}
                />
              );
            })}
          </g>
        </motion.g>
        
        {!node.isLeaf && (
          <>
            <TreeNode node={node.left} x={x - childSpacing} y={y + levelHeight} parentX={x} parentY={y} level={level + 1} maxWidth={maxWidth} />
            <TreeNode node={node.right} x={x + childSpacing} y={y + levelHeight} parentX={x} parentY={y} level={level + 1} maxWidth={maxWidth} />
            <text x={x - childSpacing / 2 - 12} y={y + levelHeight / 2} fill="#10b981" fontSize={11} fontWeight="bold">Yes</text>
            <text x={x + childSpacing / 2 + 8} y={y + levelHeight / 2} fill="#f43f5e" fontSize={11} fontWeight="bold">No</text>
          </>
        )}
      </g>
    );
  };
  
  const theory = (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700">
      <div>
        <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          Understanding Decision Trees
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Decision trees work like a game of "20 questions" - they ask yes/no questions about your data to narrow down the answer.
          Each split divides the data based on a feature, choosing splits that best separate the classes. The algorithm picks
          splits that maximize information gain (reduce uncertainty the most).
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-amber-300 mb-2">📊 Entropy</h4>
          <p className="font-mono text-white text-sm mb-2">H(S) = -Σ pᵢ log₂(pᵢ)</p>
          <p className="text-xs text-slate-400">Measures disorder/uncertainty. 0 = pure (all same class), higher = mixed</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-300 mb-2">🎯 Gini Impurity</h4>
          <p className="font-mono text-white text-sm mb-2">G(S) = 1 - Σ pᵢ²</p>
          <p className="text-xs text-slate-400">Probability of misclassifying a random sample. Lower = better</p>
        </div>
      </div>
      
      <MathExplanation
        title="How Decision Trees Build Themselves"
        intuition="Imagine sorting fruits: first ask 'Is it round?' to separate oranges from bananas. Then ask 'Is it orange?' to separate oranges from apples. Each question (split) makes the groups purer until everything is sorted!"
        steps={[
          {
            text: "Start at the root with all data",
            explanation: "Begin with the entire dataset in one node"
          },
          {
            text: "Calculate impurity (entropy or gini) of current node",
            formula: "H(S) = -Σ pᵢ log₂(pᵢ)  OR  G(S) = 1 - Σ pᵢ²",
            explanation: "Measure how mixed the classes are at this node"
          },
          {
            text: "For each feature and threshold, calculate information gain",
            formula: "IG = H(parent) - Σ (|child|/|parent|) × H(child)",
            explanation: "How much does this split reduce uncertainty?"
          },
          {
            text: "Choose the split with highest information gain",
            explanation: "Pick the feature and threshold that best separates the classes"
          },
          {
            text: "Create child nodes and repeat recursively",
            explanation: "Split the data and repeat steps 2-4 for each child"
          },
          {
            text: "Stop when: max depth reached, too few samples, or node is pure",
            explanation: "Stopping prevents overfitting and creates leaf nodes"
          }
        ]}
        example={[
          "Node with 10 samples: 6 Class A, 4 Class B",
          "Entropy = -(0.6×log₂(0.6) + 0.4×log₂(0.4)) = 0.971",
          "",
          "Try split: x₁ ≤ 5",
          "Left (6 samples): 5 Class A, 1 Class B → H=0.65",
          "Right (4 samples): 1 Class A, 3 Class B → H=0.81",
          "Weighted avg = (6/10)×0.65 + (4/10)×0.81 = 0.714",
          "Information Gain = 0.971 - 0.714 = 0.257 ✓",
          "",
          "This split reduces uncertainty by 0.257 bits!",
          "If it's the best split, we use it to divide the node."
        ]}
      />
    </div>
  );
  
  return (
    <AlgorithmLayout
      title="Decision Trees"
      description="Hierarchical classification using recursive feature-based splits"
      icon={TreeDeciduous}
      color="from-amber-500 to-orange-500"
      theory={theory}
    >
      {showTutorial && <TutorialSystem tutorial={decisionTreeTutorial} onClose={() => setShowTutorial(false)} renderInteractive={() => <div className="text-slate-300 p-4 bg-slate-900 rounded">Click tree nodes and adjust parameters!</div>} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-lg">Tree Structure</h3>
                <InfoIcon content="Click any node to see details! Decision nodes (rectangles) split data, Leaf nodes predict classes. The colored bar shows class distribution in each node." />
              </div>
              <Button size="sm" variant="outline" onClick={() => setData(generateSampleData())} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <RotateCcw className="w-4 h-4 mr-1" />
                New Data
              </Button>
            </div>
            
            <div className="overflow-x-auto bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl p-6 border border-slate-800">
              <svg width={800} height={500} className="mx-auto">
                <TreeNode node={tree} x={400} y={20} level={0} maxWidth={700} />
              </svg>
            </div>
            
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs text-amber-300">
                💡 <strong>How to read:</strong> Start at the top (root). Each decision node asks "Is {'{'}feature{'}'} ≤ {'{'}value{'}'}?". 
                Go LEFT for Yes, RIGHT for No. Leaf nodes show final predictions with confidence based on sample distribution.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-slate-400">Decision Boundary</h4>
                  <InfoIcon content="Shows how the tree partitions the feature space. Each region is assigned to a class based on the leaf node's prediction." />
                </div>
                <Button size="sm" variant="ghost" onClick={() => setShowBoundary(!showBoundary)} className="h-6 text-xs">
                  {showBoundary ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
              {showBoundary && (
                <svg width="100%" height={220} viewBox="0 0 300 220" className="bg-slate-950 rounded-lg">
                  {(() => {
                    const predict = (node, x1, x2) => {
                      if (node.isLeaf) return node.prediction;
                      const val = node.feature === 'x1' ? x1 : x2;
                      if (val <= node.threshold) return predict(node.left, x1, x2);
                      return predict(node.right, x1, x2);
                    };
                    const resolution = 50;
                    const rects = [];
                    for (let i = 0; i < resolution; i++) {
                      for (let j = 0; j < resolution; j++) {
                        const x1 = (i / resolution) * 10;
                        const x2 = (j / resolution) * 10;
                        const cls = predict(tree, x1, x2);
                        rects.push(
                          <rect
                            key={`${i}-${j}`}
                            x={30 + (i / resolution) * 240}
                            y={190 - (j / resolution) * 170}
                            width={240 / resolution + 1}
                            height={170 / resolution + 1}
                            fill={classColors[cls] + '44'}
                          />
                        );
                      }
                    }
                    return rects;
                  })()}
                  
                  {data.map((d, i) => (
                    <circle key={i} cx={30 + (d.x1 / 10) * 240} cy={190 - (d.x2 / 10) * 170} r={3} fill={classColors[d.class]} stroke="#fff" strokeWidth={1} />
                  ))}
                  
                  <line x1={30} y1={190} x2={270} y2={190} stroke="#475569" strokeWidth={2} />
                  <line x1={30} y1={20} x2={30} y2={190} stroke="#475569" strokeWidth={2} />
                  <text x={150} y={210} textAnchor="middle" fill="#64748b" fontSize={11}>X₁</text>
                  <text x={10} y={105} textAnchor="middle" fill="#64748b" fontSize={11} transform="rotate(-90, 10, 105)">X₂</text>
                </svg>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-medium text-slate-400">Split Criterion</h4>
                <InfoIcon content={`Currently using ${params.criterion.value}. This metric determines how to evaluate potential splits when building the tree.`} />
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-amber-300 font-semibold">Impurity Range</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Pure</span>
                    <div className="flex-1 h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" />
                    <span className="text-xs text-slate-400">Mixed</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    {params.criterion.value === 'entropy' ? 'Entropy: 0 (pure) → 1.58 (balanced 3-class)' : 'Gini: 0 (pure) → 0.67 (balanced 3-class)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Dataset Info */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-sm font-medium text-slate-400">Dataset Overview</h4>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                <div className="text-xl font-bold text-amber-400">{data.length}</div>
                <div className="text-xs text-slate-400 mt-1">Samples</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                <div className="text-xl font-bold text-orange-400">3</div>
                <div className="text-xs text-slate-400 mt-1">Classes</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                <div className="text-xl font-bold text-cyan-400">2</div>
                <div className="text-xs text-slate-400 mt-1">Features</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {[0, 1, 2].map(cls => {
                const count = data.filter(d => d.class === cls).length;
                return (
                  <div key={cls} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: classColors[cls] }} />
                      <span className="text-slate-300">Class {cls}</span>
                    </div>
                    <span className="font-mono font-semibold" style={{ color: classColors[cls] }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <HyperparameterPanel params={params} onChange={setParams} title="Tree Parameters" />
          
          <MetricsDisplay
            metrics={[
              { label: 'Accuracy', value: accuracy * 100, decimals: 1, description: '%', tooltip: 'Percentage of correctly classified training samples.' },
              { label: 'Tree Depth', value: params.maxDepth.value, decimals: 0, tooltip: 'Maximum levels in the tree. Depth 1 = just root decision.' },
              { label: 'Total Nodes', value: nodeStats.total, decimals: 0, tooltip: 'All nodes including decision and leaf nodes.' },
              { label: 'Leaf Nodes', value: nodeStats.leaves, decimals: 0, tooltip: 'Terminal nodes that make final predictions.' }
            ]}
          />
          
          {selectedNode && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-lg">
              <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <TreeDeciduous className="w-4 h-4 text-amber-400" />
                Selected Node Details
              </h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500">Type:</span>
                  <span className="text-white font-semibold">{selectedNode.isLeaf ? '🍃 Leaf' : '🔀 Decision'}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500">Samples:</span>
                  <span className="text-white font-semibold">{selectedNode.samples}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500">{params.criterion.value === 'entropy' ? 'Entropy' : 'Gini'}:</span>
                  <span className="text-white font-mono font-semibold">{selectedNode.impurity.toFixed(4)}</span>
                </div>
                {!selectedNode.isLeaf && (
                  <>
                    <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-500">Split Rule:</span>
                      <span className="text-emerald-400 font-mono">{selectedNode.feature} ≤ {selectedNode.threshold.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                      <span className="text-slate-300">Info Gain:</span>
                      <span className="text-emerald-400 font-mono font-bold">{selectedNode.informationGain?.toFixed(4)}</span>
                    </div>
                  </>
                )}
                {selectedNode.isLeaf && (
                  <div className="flex justify-between p-2 rounded-lg" style={{ backgroundColor: classColors[selectedNode.prediction] + '22', border: `1px solid ${classColors[selectedNode.prediction]}44` }}>
                    <span className="text-slate-300">Prediction:</span>
                    <span style={{ color: classColors[selectedNode.prediction] }} className="font-bold">Class {selectedNode.prediction}</span>
                  </div>
                )}
                
                <div className="pt-2 border-t border-slate-700">
                  <span className="text-slate-500 text-xs mb-2 block">Class Distribution:</span>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(selectedNode.classCounts || {}).map(([cls, count]) => (
                      <span key={cls} className="px-2 py-1 rounded-md text-xs font-semibold" style={{ backgroundColor: classColors[parseInt(cls)] + '33', color: classColors[parseInt(cls)] }}>
                        C{cls}: {count} ({((count / selectedNode.samples) * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <FormulaDisplay
            title="Information Gain Formula"
            formula="IG = H(parent) - Σ (|child|/|parent|) × H(child)"
            explanation="Measures how much a split reduces uncertainty. Higher gain = better split!"
            variables={[
              { symbol: 'H', value: 'Impurity (Entropy/Gini)' },
              { symbol: '|S|', value: 'Number of samples' }
            ]}
          />
        </div>
      </div>
    </AlgorithmLayout>
  );
}