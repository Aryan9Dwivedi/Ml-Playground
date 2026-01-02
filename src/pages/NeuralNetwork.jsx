import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, Pause, RotateCcw, Zap, ArrowRight, Sparkles, Eye, Layers as LayersIcon, Activity, Database, EyeOff, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TutorialSystem from '@/components/shared/TutorialSystem';
import { neuralNetworkTutorial } from '@/components/shared/tutorials';
import AlgorithmLayout from '@/components/shared/AlgorithmLayout';
import HyperparameterPanel from '@/components/shared/HyperparameterPanel';
import MetricsDisplay from '@/components/shared/MetricsDisplay';
import FormulaDisplay from '@/components/shared/FormulaDisplay';
import MathExplanation from '@/components/shared/MathExplanation';
import Tooltip, { InfoIcon } from '@/components/shared/Tooltip';

const sigmoid = (x) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
const sigmoidDerivative = (x) => x * (1 - x);
const relu = (x) => Math.max(0, x);
const reluDerivative = (x) => x > 0 ? 1 : 0;
const tanh_ = (x) => Math.tanh(x);
const tanhDerivative = (x) => 1 - x * x;

const generateSampleData = () => {
  const data = [];
  for (let i = 0; i < 60; i++) {
    const x1 = Math.random();
    const x2 = Math.random();
    const cls = ((x1 > 0.5) !== (x2 > 0.5)) ? 1 : 0;
    data.push({ x1, x2, class: cls });
  }
  return data;
};

export default function NeuralNetwork() {
  const [data, setData] = useState(generateSampleData());
  const [params, setParams] = useState({
    hiddenLayers: {
      type: 'slider',
      label: 'Hidden Layers',
      value: 2,
      min: 1,
      max: 6,
      step: 1,
      decimals: 0,
      description: 'Number of hidden layers between input and output. More layers = deeper network = more abstract features'
    },
    neuronsPerLayer: {
      type: 'slider',
      label: 'Neurons per Layer',
      value: 8,
      min: 3,
      max: 20,
      step: 1,
      decimals: 0,
      description: 'More neurons = more capacity to learn complex patterns but higher risk of overfitting'
    },
    learningRate: {
      type: 'slider',
      label: 'Learning Rate (α)',
      value: 0.5,
      min: 0.01,
      max: 2,
      step: 0.01,
      decimals: 2,
      description: 'Step size for weight updates. Too high = unstable, too low = slow'
    },
    activation: {
      type: 'select',
      label: 'Activation Function',
      value: 'sigmoid',
      options: [
        { value: 'sigmoid', label: 'Sigmoid (0 to 1)' },
        { value: 'tanh', label: 'Tanh (-1 to 1)' },
        { value: 'relu', label: 'ReLU (0 to ∞)' }
      ],
      description: 'Non-linearity that helps network learn complex patterns'
    },
    epochs: {
      type: 'slider',
      label: 'Training Epochs',
      value: 500,
      min: 100,
      max: 2000,
      step: 100,
      decimals: 0,
      description: 'Number of complete passes through the dataset'
    },
    showWeights: {
      type: 'switch',
      label: 'Show Weight Magnitudes',
      value: true,
      description: 'Visualize connection strength by thickness and color'
    }
  });
  
  const [network, setNetwork] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedNeuron, setSelectedNeuron] = useState(null);
  const [activations, setActivations] = useState(null);
  const [gradients, setGradients] = useState(null);
  const [showActivationViz, setShowActivationViz] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const getActivation = useCallback((name) => {
    switch (name) {
      case 'relu': return { fn: relu, derivative: reluDerivative };
      case 'tanh': return { fn: tanh_, derivative: tanhDerivative };
      default: return { fn: sigmoid, derivative: sigmoidDerivative };
    }
  }, []);
  
  const initializeNetwork = useCallback(() => {
    const layers = [2];
    for (let i = 0; i < params.hiddenLayers.value; i++) {
      layers.push(params.neuronsPerLayer.value);
    }
    layers.push(1);
    
    const weights = [];
    const biases = [];
    
    for (let i = 0; i < layers.length - 1; i++) {
      const layerWeights = [];
      for (let j = 0; j < layers[i + 1]; j++) {
        const neuronWeights = [];
        for (let k = 0; k < layers[i]; k++) {
          neuronWeights.push((Math.random() - 0.5) * 2 * Math.sqrt(2 / (layers[i] + layers[i + 1])));
        }
        layerWeights.push(neuronWeights);
      }
      weights.push(layerWeights);
      biases.push(Array(layers[i + 1]).fill(0).map(() => (Math.random() - 0.5) * 0.1));
    }
    
    return { layers, weights, biases };
  }, [params.hiddenLayers.value, params.neuronsPerLayer.value]);
  
  const forwardPass = useCallback((net, input) => {
    const { fn } = getActivation(params.activation.value);
    const activations = [input];
    const preActivations = [input];
    
    let current = input;
    
    for (let l = 0; l < net.weights.length; l++) {
      const layerOutput = [];
      const layerPreActivation = [];
      
      for (let n = 0; n < net.weights[l].length; n++) {
        let sum = net.biases[l][n];
        for (let w = 0; w < net.weights[l][n].length; w++) {
          sum += current[w] * net.weights[l][n][w];
        }
        layerPreActivation.push(sum);
        const activation = l === net.weights.length - 1 ? sigmoid(sum) : fn(sum);
        layerOutput.push(activation);
      }
      
      preActivations.push(layerPreActivation);
      activations.push(layerOutput);
      current = layerOutput;
    }
    
    return { activations, preActivations, output: current[0] };
  }, [params.activation.value, getActivation]);
  
  const backpropagate = useCallback((net, input, target) => {
    const { derivative } = getActivation(params.activation.value);
    const lr = params.learningRate.value;
    
    const { activations, preActivations, output } = forwardPass(net, input);
    
    const outputError = output - target;
    const outputDelta = outputError * sigmoidDerivative(output);
    
    const deltas = new Array(net.weights.length);
    deltas[deltas.length - 1] = [outputDelta];
    
    for (let l = net.weights.length - 2; l >= 0; l--) {
      const layerDeltas = [];
      for (let n = 0; n < net.weights[l].length; n++) {
        let error = 0;
        for (let nextN = 0; nextN < net.weights[l + 1].length; nextN++) {
          error += deltas[l + 1][nextN] * net.weights[l + 1][nextN][n];
        }
        const activation = activations[l + 1][n];
        const delta = l === net.weights.length - 2 
          ? error * sigmoidDerivative(activation)
          : error * derivative(activation);
        layerDeltas.push(delta);
      }
      deltas[l] = layerDeltas;
    }
    
    const newWeights = net.weights.map((layer, l) =>
      layer.map((neuron, n) =>
        neuron.map((w, i) => w - lr * deltas[l][n] * activations[l][i])
      )
    );
    
    const newBiases = net.biases.map((layer, l) =>
      layer.map((b, n) => b - lr * deltas[l][n])
    );
    
    return {
      weights: newWeights,
      biases: newBiases,
      deltas,
      activations,
      loss: 0.5 * outputError * outputError
    };
  }, [params.activation.value, params.learningRate.value, getActivation, forwardPass]);
  
  const trainEpoch = useCallback((net) => {
    let totalLoss = 0;
    let updatedNet = { ...net };
    let lastActivations = null;
    let lastDeltas = null;
    
    data.forEach(point => {
      const result = backpropagate(updatedNet, [point.x1, point.x2], point.class);
      updatedNet = { ...updatedNet, weights: result.weights, biases: result.biases };
      totalLoss += result.loss;
      lastActivations = result.activations;
      lastDeltas = result.deltas;
    });
    
    return {
      network: updatedNet,
      loss: totalLoss / data.length,
      activations: lastActivations,
      deltas: lastDeltas
    };
  }, [data, backpropagate]);
  
  const runTraining = useCallback(() => {
    let net = initializeNetwork();
    const newHistory = [];
    
    for (let epoch = 0; epoch < params.epochs.value; epoch++) {
      const result = trainEpoch(net);
      net = result.network;
      
      let correct = 0;
      data.forEach(point => {
        const { output } = forwardPass(net, [point.x1, point.x2]);
        if ((output > 0.5 ? 1 : 0) === point.class) correct++;
      });
      
      newHistory.push({
        epoch,
        loss: result.loss,
        accuracy: correct / data.length,
        network: JSON.parse(JSON.stringify(net)),
        activations: result.activations,
        deltas: result.deltas
      });
    }
    
    setNetwork(net);
    setHistory(newHistory);
    setCurrentEpoch(0);
  }, [initializeNetwork, trainEpoch, params.epochs.value, data, forwardPass]);
  
  useEffect(() => {
    runTraining();
  }, []);
  
  useEffect(() => {
    if (history.length > 0 && currentEpoch < history.length) {
      setNetwork(history[currentEpoch].network);
      setActivations(history[currentEpoch].activations);
      setGradients(history[currentEpoch].deltas);
    }
  }, [currentEpoch, history]);
  
  useEffect(() => {
    let interval;
    if (isTraining && currentEpoch < history.length - 1) {
      interval = setInterval(() => {
        setCurrentEpoch(prev => {
          if (prev >= history.length - 1) {
            setIsTraining(false);
            return prev;
          }
          return prev + 1;
        });
      }, 20);
    }
    return () => clearInterval(interval);
  }, [isTraining, currentEpoch, history.length]);
  
  const currentLoss = history[currentEpoch]?.loss || 0;
  const currentAccuracy = history[currentEpoch]?.accuracy || 0;
  
  const renderNetwork = () => {
    if (!network) return null;
    
    const svgWidth = 700;
    const svgHeight = 500;
    const layerSpacing = svgWidth / (network.layers.length + 1);
    
    const nodes = [];
    const connections = [];
    const nodePositions = [];
    
    network.layers.forEach((layerSize, layerIdx) => {
      const layerPositions = [];
      const x = layerSpacing * (layerIdx + 1);
      const verticalSpacing = Math.min(60, 400 / layerSize);
      const startY = (svgHeight - (layerSize - 1) * verticalSpacing) / 2;
      
      for (let n = 0; n < layerSize; n++) {
        const y = startY + n * verticalSpacing;
        layerPositions.push({ x, y });
      }
      nodePositions.push(layerPositions);
    });
    
    // Draw connections with flowing animations
    for (let l = 0; l < network.weights.length; l++) {
      for (let n = 0; n < network.weights[l].length; n++) {
        for (let w = 0; w < network.weights[l][n].length; w++) {
          const weight = network.weights[l][n][w];
          const from = nodePositions[l][w];
          const to = nodePositions[l + 1][n];
          
          const isPositive = weight > 0;
          const baseColor = isPositive ? '#3b82f6' : '#f43f5e';
          const opacity = params.showWeights.value ? Math.min(Math.abs(weight), 1) * 0.7 : 0.25;
          const strokeWidth = params.showWeights.value ? Math.max(1, Math.abs(weight) * 4) : 1.5;
          
          const activationFlow = activations && activations[l] && activations[l + 1] 
            ? (activations[l][w] || 0) * (activations[l + 1][n] || 0)
            : 0;
          
          connections.push(
            <g key={`conn-${l}-${n}-${w}`}>
              {/* Connection line with gradient */}
              <motion.line
                x1={from.x + 18}
                y1={from.y}
                x2={to.x - 18}
                y2={to.y}
                stroke={baseColor}
                strokeWidth={strokeWidth}
                opacity={opacity}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: opacity }}
                transition={{ duration: 0.8, delay: l * 0.1 + w * 0.02 }}
                filter="url(#glow)"
              />
              

            </g>
          );
        }
      }
    }
    
    // Draw nodes
    nodePositions.forEach((layer, layerIdx) => {
      const isInput = layerIdx === 0;
      const isOutput = layerIdx === nodePositions.length - 1;
      const layerName = isInput ? 'Input' : isOutput ? 'Output' : `Hidden ${layerIdx}`;
      
      layer.forEach((pos, nodeIdx) => {
        let activation = 0;
        if (activations && activations[layerIdx]) {
          activation = activations[layerIdx][nodeIdx] || 0;
        }
        
        const gradient = gradients && gradients[layerIdx - 1] ? Math.abs(gradients[layerIdx - 1][nodeIdx] || 0) : 0;
        
        nodes.push(
          <g key={`node-${layerIdx}-${nodeIdx}`}>
            {/* Outer glow ring */}
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={28}
              fill="url(#pointGlow)"
              style={{ color: gradient > 0.1 ? '#f43f5e' : '#3b82f6' }}
              opacity={Math.min(activation * 0.6, 0.5)}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [Math.min(activation * 0.6, 0.5), Math.min(activation * 0.8, 0.7), Math.min(activation * 0.6, 0.5)]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="pointer-events-none"
            />
            
            {/* Gradient glow pulse */}
            {gradient > 0.01 && (
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill={gradient > 0.1 ? '#f43f5e' : '#10b981'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0, Math.min(gradient * 2, 0.5), 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                filter="url(#strongGlow)"
                className="pointer-events-none"
              />
            )}
            
            {/* Main neuron with enhanced styling */}
            <Tooltip content={`${layerName} Layer, Neuron ${nodeIdx + 1}\nActivation: ${activation.toFixed(4)}\nGradient: ${gradient.toFixed(4)}\n\nClick to inspect weights!`}>
              <g style={{ pointerEvents: 'all' }}>
                {/* Outer ring */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={18}
                  fill="none"
                  stroke={selectedNeuron?.layer === layerIdx && selectedNeuron?.node === nodeIdx ? '#fff' : '#475569'}
                  strokeWidth={selectedNeuron?.layer === layerIdx && selectedNeuron?.node === nodeIdx ? 3 : 1.5}
                  opacity={0.6}
                  className="transition-all"
                />
                
                {/* Main neuron body */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={16}
                  fill={`rgba(59, 130, 246, ${Math.min(activation, 1) * 0.85 + 0.15})`}
                  stroke={selectedNeuron?.layer === layerIdx && selectedNeuron?.node === nodeIdx ? '#fff' : 'rgba(59, 130, 246, 0.8)'}
                  strokeWidth={selectedNeuron?.layer === layerIdx && selectedNeuron?.node === nodeIdx ? 3 : 2}
                  className="cursor-pointer transition-all"
                  filter="url(#strongGlow)"
                  onClick={() => setSelectedNeuron({ layer: layerIdx, node: nodeIdx })}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: layerIdx * 0.1 + nodeIdx * 0.03 
                  }}
                  whileHover={{ 
                    scale: 1.25,
                    transition: { duration: 0.2 }
                  }}
                  style={{
                    filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.6))'
                  }}
                />
                
                {/* Inner highlight */}
                <motion.circle
                  cx={pos.x - 4}
                  cy={pos.y - 4}
                  r={5}
                  fill="rgba(255, 255, 255, 0.4)"
                  className="pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </g>
            </Tooltip>
            
            {/* Activation value with better styling */}
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              fill="#fff"
              fontSize={10}
              fontWeight="bold"
              className="pointer-events-none"
              style={{
                textShadow: '0 0 8px rgba(0,0,0,0.8), 0 0 4px rgba(59,130,246,0.6)',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
              }}
            >
              {activation.toFixed(2)}
            </text>
          </g>
        );
      });
      
      // Layer label
      nodes.push(
        <text
          key={`label-${layerIdx}`}
          x={nodePositions[layerIdx][0].x}
          y={30}
          textAnchor="middle"
          fill="#64748b"
          fontSize={12}
          fontWeight="bold"
        >
          {layerName}
        </text>
      );
    });
    
    return (
      <svg width={svgWidth} height={svgHeight} className="mx-auto">
        <defs>
          <radialGradient id="pointGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Animated background particles */}
        {[...Array(15)].map((_, i) => (
          <motion.circle
            key={`particle-${i}`}
            r={Math.random() * 2 + 1}
            fill="#3b82f6"
            opacity={0.2}
            initial={{
              cx: Math.random() * svgWidth,
              cy: Math.random() * svgHeight
            }}
            animate={{
              cx: [Math.random() * svgWidth, Math.random() * svgWidth],
              cy: [Math.random() * svgHeight, Math.random() * svgHeight],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
        
        {connections}
        {nodes}
      </svg>
    );
  };
  
  const theory = (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700">
      <div>
        <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          Understanding Neural Networks
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Neural networks are inspired by how brains work! Information flows forward through layers of neurons, each applying weights 
          and activation functions. During training (backpropagation), we adjust weights based on errors, gradually learning to 
          map inputs to outputs. The network learns by finding patterns in data - no explicit programming needed!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 border border-indigo-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-indigo-300 mb-2">⚡ Forward Propagation</h4>
          <p className="font-mono text-white text-xs mb-2">z = Wx + b<br/>a = σ(z)</p>
          <p className="text-xs text-slate-400">Compute predictions layer by layer</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-300 mb-2">🔄 Backpropagation</h4>
          <p className="font-mono text-white text-xs mb-2">δ = ∂L/∂z<br/>∇W = δ·aᵀ</p>
          <p className="text-xs text-slate-400">Calculate error gradients backward</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/30 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-300 mb-2">📉 Gradient Descent</h4>
          <p className="font-mono text-white text-xs mb-2">W := W - α·∇W</p>
          <p className="text-xs text-slate-400">Update weights to reduce error</p>
        </div>
      </div>
      
      <MathExplanation
        title="How Neural Networks Learn (Backpropagation Explained)"
        intuition="Think of learning to throw darts. You throw (forward pass), see how far you missed (loss), figure out how to adjust your throw (backprop), and try again (weight update). Each iteration gets you closer to the bullseye!"
        steps={[
          {
            text: "Initialize random weights and biases",
            formula: "W ~ Normal(0, √(2/(n_in + n_out)))",
            explanation: "Start with small random values. Xavier/He initialization prevents vanishing/exploding gradients"
          },
          {
            text: "Forward Pass: Calculate activations layer by layer",
            formula: "z^[l] = W^[l]·a^[l-1] + b^[l]\na^[l] = σ(z^[l])",
            explanation: "Multiply by weights, add bias, apply activation function. Repeat for each layer"
          },
          {
            text: "Calculate loss (error) at output",
            formula: "L = 1/2·(y - ŷ)²  or  L = -y·log(ŷ) - (1-y)·log(1-ŷ)",
            explanation: "MSE for regression, Cross-Entropy for classification. Measures prediction error"
          },
          {
            text: "Backpropagation: Calculate gradients from output to input",
            formula: "δ^[L] = (ŷ - y) ⊙ σ'(z^[L])\nδ^[l] = (W^[l+1])ᵀ·δ^[l+1] ⊙ σ'(z^[l])",
            explanation: "Chain rule! Error at each layer depends on error from next layer"
          },
          {
            text: "Calculate weight and bias gradients",
            formula: "∂L/∂W^[l] = δ^[l]·(a^[l-1])ᵀ\n∂L/∂b^[l] = δ^[l]",
            explanation: "Gradient shows direction to move weights to reduce error"
          },
          {
            text: "Update weights using gradient descent",
            formula: "W^[l] := W^[l] - α·∂L/∂W^[l]\nb^[l] := b^[l] - α·∂L/∂b^[l]",
            explanation: "Learning rate α controls step size. Small steps = slow but stable"
          },
          {
            text: "Repeat for all training examples and epochs",
            explanation: "One epoch = complete pass through dataset. Keep iterating until convergence"
          }
        ]}
        example={[
          "Simple example: 2 inputs → 2 hidden → 1 output",
          "",
          "Input: x = [0.8, 0.3], Target: y = 1",
          "",
          "Forward Pass:",
          "Hidden layer: z₁ = w₁·0.8 + w₂·0.3 + b = 0.5",
          "             a₁ = σ(0.5) = 0.622",
          "Output: z = w₃·0.622 + b = 0.3",
          "        ŷ = σ(0.3) = 0.574",
          "",
          "Loss: L = (1 - 0.574)² = 0.181",
          "",
          "Backpropagation:",
          "Output error: δ_out = (0.574 - 1)·σ'(0.574) = -0.105",
          "Hidden error: δ_hid = w₃·(-0.105)·σ'(0.622) = -0.025",
          "",
          "Weight updates (α=0.1):",
          "w₃ := w₃ - 0.1·(-0.105)·0.622 = w₃ + 0.0065",
          "w₁ := w₁ - 0.1·(-0.025)·0.8 = w₁ + 0.002",
          "",
          "After update, ŷ moves closer to 1! ✓"
        ]}
      />
    </div>
  );
  
  return (
    <AlgorithmLayout
      title="Neural Networks"
      description="Multi-layer perceptron with backpropagation learning algorithm"
      icon={Brain}
      color="from-indigo-500 to-blue-500"
      theory={theory}
    >
      {showTutorial && <TutorialSystem tutorial={neuralNetworkTutorial} onClose={() => setShowTutorial(false)} renderInteractive={() => <div className="text-slate-300 p-4 bg-slate-900 rounded">Click neurons, adjust layers, and watch training!</div>} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Network Architecture */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-lg">Network Architecture</h3>
                <InfoIcon content="CLICK neurons to inspect weights and biases! Color intensity = activation strength. Line thickness = weight magnitude. Watch information flow through the network!" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={runTraining} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  <Zap className="w-4 h-4 mr-1" />
                  Retrain
                </Button>
                <Button size="sm" onClick={() => setShowTutorial(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Tutorial
                </Button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl p-4 border border-slate-800">
              {renderNetwork()}
            </div>
            
            <div className="flex items-center justify-between mt-4 text-xs">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-blue-500" />
                  <span className="text-slate-400">Positive weight</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-rose-500" />
                  <span className="text-slate-400">Negative weight</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/30" />
                  <span className="text-slate-400">High gradient (learning)</span>
                </div>
              </div>
              <span className="text-slate-500">
                Total params: {network?.weights.reduce((sum, l) => sum + l.reduce((s, n) => s + n.length, 0), 0) || 0} weights + 
                {network?.biases.reduce((sum, l) => sum + l.length, 0) || 0} biases
              </span>
            </div>
          </div>
          
          {/* Training Progress */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 font-medium">Training Progress</span>
                  <InfoIcon content="Watch the network learn! Loss should decrease and accuracy increase. If loss plateaus, try adjusting learning rate or architecture." />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-mono">
                    {currentEpoch}
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-xl text-slate-400 font-mono">{history.length - 1}</span>
                  <span className="text-sm text-slate-500 ml-2">epochs</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Tooltip content="Reset to beginning">
                  <Button onClick={() => { setCurrentEpoch(0); setIsTraining(false); }} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content={isTraining ? "Pause training animation" : "Watch training animation"}>
                  <Button onClick={() => setIsTraining(!isTraining)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
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
              value={currentEpoch}
              onChange={(e) => { setCurrentEpoch(parseInt(e.target.value)); setIsTraining(false); }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Loss & Accuracy Curves */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-medium text-slate-400">Loss Curve (MSE)</h4>
                <InfoIcon content="Mean Squared Error over epochs. Should decrease smoothly. Spikes indicate learning rate too high." />
              </div>
              <svg width="100%" height={140} viewBox="0 0 300 140" preserveAspectRatio="none" className="bg-slate-950 rounded-lg">
                <defs>
                  <linearGradient id="lossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {history.length > 1 && (() => {
                  const maxLoss = Math.max(...history.map(h => h.loss), 0.1);
                  const path = history.map((h, i) => {
                    const x = (i / (history.length - 1)) * 280 + 10;
                    const y = 130 - (h.loss / maxLoss) * 120;
                    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                  }).join(' ');
                  const areaPath = path + ' L290,130 L10,130 Z';
                  const currentX = (currentEpoch / (history.length - 1)) * 280 + 10;
                  const currentY = 130 - (history[currentEpoch]?.loss / maxLoss) * 120;
                  return (
                    <>
                      <path d={areaPath} fill="url(#lossGrad)" />
                      <path d={path} fill="none" stroke="#f43f5e" strokeWidth={2.5} />
                      <circle cx={currentX} cy={currentY} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
                      <text x={currentX} y={currentY - 12} textAnchor="middle" fill="#f43f5e" fontSize={11} fontWeight="bold">
                        {history[currentEpoch]?.loss.toFixed(4)}
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>
            
            <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-medium text-slate-400">Accuracy Curve</h4>
                <InfoIcon content="Classification accuracy over epochs. Should increase and plateau. 100% on training data might indicate overfitting." />
              </div>
              <svg width="100%" height={140} viewBox="0 0 300 140" preserveAspectRatio="none" className="bg-slate-950 rounded-lg">
                <defs>
                  <linearGradient id="accGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {history.length > 1 && (() => {
                  const path = history.map((h, i) => {
                    const x = (i / (history.length - 1)) * 280 + 10;
                    const y = 130 - h.accuracy * 120;
                    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                  }).join(' ');
                  const areaPath = path + ' L290,130 L10,130 Z';
                  const currentX = (currentEpoch / (history.length - 1)) * 280 + 10;
                  const currentY = 130 - (history[currentEpoch]?.accuracy || 0) * 120;
                  return (
                    <>
                      <path d={areaPath} fill="url(#accGrad)" />
                      <path d={path} fill="none" stroke="#10b981" strokeWidth={2.5} />
                      <circle cx={currentX} cy={currentY} r={5} fill="#10b981" stroke="#fff" strokeWidth={2} />
                      <text x={currentX} y={currentY - 12} textAnchor="middle" fill="#10b981" fontSize={11} fontWeight="bold">
                        {((history[currentEpoch]?.accuracy || 0) * 100).toFixed(1)}%
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
          
          {/* Activation Function Visualization */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">Activation Function: {params.activation.value}</h3>
                <InfoIcon content="The non-linear function applied after each layer. Different functions have different properties - try them all!" />
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowActivationViz(!showActivationViz)}>
                {showActivationViz ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
            
            {showActivationViz && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-slate-400 mb-2 font-semibold">Function Shape</h4>
                  <svg width="100%" height={120} viewBox="0 0 240 120" className="bg-slate-950 rounded-lg border border-slate-800">
                    <line x1={10} y1={60} x2={230} y2={60} stroke="#475569" strokeWidth={1.5} />
                    <line x1={120} y1={10} x2={120} y2={110} stroke="#475569" strokeWidth={1.5} />
                    <path
                      d={Array.from({ length: 80 }, (_, i) => {
                        const x = (i / 79) * 220 + 10;
                        const inputVal = (i / 79) * 10 - 5;
                        let y;
                        switch (params.activation.value) {
                          case 'relu': y = 60 - Math.max(0, inputVal) * 8; break;
                          case 'tanh': y = 60 - Math.tanh(inputVal) * 40; break;
                          default: y = 60 - sigmoid(inputVal) * 80 + 40;
                        }
                        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                    />
                    <text x={120} y={10} textAnchor="middle" fill="#8b5cf6" fontSize={10} fontWeight="bold">
                      {params.activation.value}
                    </text>
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs text-slate-400 mb-2 font-semibold">Properties</h4>
                  <div className="text-xs space-y-2">
                    {params.activation.value === 'sigmoid' && (
                      <>
                        <div className="p-2 bg-purple-500/10 rounded border border-purple-500/30">
                          <strong className="text-purple-300">Range:</strong> <span className="text-slate-300">(0, 1)</span>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded border border-blue-500/30">
                          <strong className="text-blue-300">Use:</strong> <span className="text-slate-300">Output layer for binary classification</span>
                        </div>
                        <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30">
                          <strong className="text-amber-300">Issue:</strong> <span className="text-slate-300">Vanishing gradients for deep networks</span>
                        </div>
                      </>
                    )}
                    {params.activation.value === 'relu' && (
                      <>
                        <div className="p-2 bg-purple-500/10 rounded border border-purple-500/30">
                          <strong className="text-purple-300">Range:</strong> <span className="text-slate-300">[0, ∞)</span>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded border border-blue-500/30">
                          <strong className="text-blue-300">Use:</strong> <span className="text-slate-300">Hidden layers (most popular!)</span>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/30">
                          <strong className="text-emerald-300">Benefit:</strong> <span className="text-slate-300">Fast, no vanishing gradients</span>
                        </div>
                      </>
                    )}
                    {params.activation.value === 'tanh' && (
                      <>
                        <div className="p-2 bg-purple-500/10 rounded border border-purple-500/30">
                          <strong className="text-purple-300">Range:</strong> <span className="text-slate-300">(-1, 1)</span>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded border border-blue-500/30">
                          <strong className="text-blue-300">Use:</strong> <span className="text-slate-300">Hidden layers, zero-centered</span>
                        </div>
                        <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
                          <strong className="text-cyan-300">Benefit:</strong> <span className="text-slate-300">Better than sigmoid for hidden layers</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Decision Boundary */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-white">Learned Decision Boundary</h3>
              <InfoIcon content="Shows what the network learned! The boundary separates Class 0 (blue) from Class 1 (purple). Non-linear boundaries require hidden layers." />
            </div>
            <svg width={500} height={300} className="mx-auto bg-slate-950 rounded-lg border border-slate-800">
              {network && (() => {
                const resolution = 45;
                const rects = [];
                for (let i = 0; i < resolution; i++) {
                  for (let j = 0; j < resolution; j++) {
                    const x1 = i / resolution;
                    const x2 = j / resolution;
                    const { output } = forwardPass(network, [x1, x2]);
                    rects.push(
                      <rect
                        key={`${i}-${j}`}
                        x={30 + (i / resolution) * 440}
                        y={270 - (j / resolution) * 250}
                        width={440 / resolution + 1}
                        height={250 / resolution + 1}
                        fill={output > 0.5 ? `rgba(139, 92, 246, ${output * 0.6})` : `rgba(59, 130, 246, ${(1 - output) * 0.6})`}
                      />
                    );
                  }
                }
                return rects;
              })()}
              
              {data.map((d, i) => (
                <circle
                  key={i}
                  cx={30 + d.x1 * 440}
                  cy={270 - d.x2 * 250}
                  r={4}
                  fill={d.class === 1 ? '#8b5cf6' : '#3b82f6'}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                />
              ))}
              
              <line x1={30} y1={270} x2={470} y2={270} stroke="#475569" strokeWidth={2} />
              <line x1={30} y1={20} x2={30} y2={270} stroke="#475569" strokeWidth={2} />
              <text x={250} y={295} textAnchor="middle" fill="#64748b" fontSize={12}>Input X₁</text>
              <text x={10} y={145} textAnchor="middle" fill="#64748b" fontSize={12} transform="rotate(-90, 10, 145)">Input X₂</text>
            </svg>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="space-y-6">
          {/* Dataset Info */}
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Database className="w-4 h-4 text-indigo-400" />
              </div>
              <h4 className="text-sm font-medium text-slate-400">Dataset Overview</h4>
              <InfoIcon content="Training data for XOR-like pattern. This problem requires hidden layers - linear models can't solve it!" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                <div className="text-2xl font-bold text-indigo-400">{data.length}</div>
                <div className="text-xs text-slate-400 mt-1">Samples</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                <div className="text-2xl font-bold text-purple-400">2</div>
                <div className="text-xs text-slate-400 mt-1">Classes</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {[0, 1].map(cls => {
                const count = data.filter(d => d.class === cls).length;
                return (
                  <div key={cls} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cls === 0 ? '#3b82f6' : '#8b5cf6' }} />
                      <span className="text-slate-300">Class {cls}</span>
                    </div>
                    <span className="font-mono font-semibold" style={{ color: cls === 0 ? '#3b82f6' : '#8b5cf6' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <HyperparameterPanel params={params} onChange={setParams} title="Network Configuration" />
          
          <MetricsDisplay
            metrics={[
              { label: 'Loss (MSE)', value: currentLoss, decimals: 6, tooltip: 'Mean Squared Error. Target: close to 0. Measures average prediction error.' },
              { label: 'Accuracy', value: currentAccuracy * 100, decimals: 1, description: '%', tooltip: 'Classification accuracy on training set. 100% = perfect, but watch for overfitting!' },
              { label: 'Total Weights', value: network?.weights.reduce((sum, l) => sum + l.reduce((s, n) => s + n.length, 0), 0) || 0, decimals: 0, tooltip: 'Number of learnable weight parameters. More = more capacity but risk of overfitting.' },
              { label: 'Total Neurons', value: network?.layers.reduce((a, b) => a + b, 0) || 0, decimals: 0, tooltip: 'All neurons across all layers including input and output.' }
            ]}
          />
          
          {selectedNeuron && network && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/40">
              <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                Neuron Inspector (L{selectedNeuron.layer}, N{selectedNeuron.node})
              </h4>
              
              {selectedNeuron.layer > 0 && (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-slate-500 mb-1.5 font-semibold">Incoming Weights:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {network.weights[selectedNeuron.layer - 1]?.[selectedNeuron.node]?.map((w, i) => (
                        <Tooltip key={i} content={`Weight from previous neuron ${i + 1}\nValue: ${w.toFixed(5)}\n${w > 0 ? 'Excitatory (increases activation)' : 'Inhibitory (decreases activation)'}`}>
                          <span 
                            className={`px-2 py-1 rounded-md font-mono font-semibold cursor-help ${w > 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}
                          >
                            w{i}: {w.toFixed(3)}
                          </span>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-slate-500 mb-1 font-semibold">Bias:</div>
                    <Tooltip content={`Bias term added before activation\nValue: ${network.biases[selectedNeuron.layer - 1]?.[selectedNeuron.node]?.toFixed(5)}\nShifts the activation threshold`}>
                      <span className="px-3 py-1.5 rounded-md font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block cursor-help font-semibold">
                        b: {network.biases[selectedNeuron.layer - 1]?.[selectedNeuron.node]?.toFixed(4)}
                      </span>
                    </Tooltip>
                  </div>
                </div>
              )}
              
              {activations && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="text-slate-400 mb-1">Activation:</div>
                      <div className="text-xl font-mono font-bold text-blue-400">
                        {(activations[selectedNeuron.layer]?.[selectedNeuron.node] || 0).toFixed(4)}
                      </div>
                    </div>
                    <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/30">
                      <div className="text-slate-400 mb-1">Gradient:</div>
                      <div className="text-xl font-mono font-bold text-rose-400">
                        {Math.abs(gradients?.[selectedNeuron.layer - 1]?.[selectedNeuron.node] || 0).toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          <div className="space-y-3">
            <FormulaDisplay
              title="Forward Pass"
              formula="z = Σ(wᵢ·xᵢ) + b,  a = σ(z)"
              explanation="Weighted sum of inputs, then apply activation function"
            />
            
            <FormulaDisplay
              title="Backpropagation"
              formula="∂L/∂w = δ · x"
              explanation="Gradient = error signal × input. Shows how to adjust weight"
              variables={[
                { symbol: 'δ', value: 'Error signal from next layer' },
                { symbol: 'x', value: 'Input from previous layer' }
              ]}
            />
          </div>
          
          <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/40">
            <h4 className="text-sm font-medium text-slate-400 mb-3">🎓 Key Concepts</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <strong className="text-indigo-300">Universal Approximator:</strong> With enough neurons, can approximate ANY function!
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <strong className="text-purple-300">Feature Learning:</strong> Hidden layers automatically extract useful patterns
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <strong className="text-blue-300">Depth vs Width:</strong> Deep (many layers) = hierarchical features. Wide = more capacity per layer
              </div>
            </div>
          </div>
        </div>
      </div>
    </AlgorithmLayout>
  );
}