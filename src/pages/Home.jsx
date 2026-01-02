import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  GitBranch, 
  Network, 
  TreeDeciduous, 
  Layers, 
  Brain,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const algorithms = [
  {
    id: 'linear-regression',
    name: 'Linear Regression',
    description: 'Visualize gradient descent, cost functions, and line fitting in real-time',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    page: 'LinearRegression'
  },
  {
    id: 'logistic-regression',
    name: 'Logistic Regression',
    description: 'Explore sigmoid functions, decision boundaries, and binary classification',
    icon: GitBranch,
    color: 'from-violet-500 to-purple-500',
    page: 'LogisticRegression'
  },
  {
    id: 'knn',
    name: 'K-Nearest Neighbors',
    description: 'See distance calculations, neighbor selection, and voting mechanisms',
    icon: Network,
    color: 'from-emerald-500 to-teal-500',
    page: 'KNN'
  },
  {
    id: 'decision-tree',
    name: 'Decision Trees',
    description: 'Watch tree construction, entropy calculations, and split decisions',
    icon: TreeDeciduous,
    color: 'from-amber-500 to-orange-500',
    page: 'DecisionTree'
  },
  {
    id: 'random-forest',
    name: 'Random Forest',
    description: 'Understand ensemble learning, bagging, and feature importance',
    icon: Layers,
    color: 'from-rose-500 to-pink-500',
    page: 'RandomForest'
  },
  {
    id: 'neural-network',
    name: 'Neural Networks',
    description: 'Visualize forward propagation, backpropagation, and weight updates',
    icon: Brain,
    color: 'from-indigo-500 to-blue-500',
    page: 'NeuralNetwork'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Interactive Machine Learning Education
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              ML Algorithm
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Visualizer
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Understand machine learning through interactive visualizations. 
              See the mathematics, watch algorithms learn, and explore hyperparameter effects in real-time.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Algorithm Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {algorithms.map((algo, index) => (
            <motion.div
              key={algo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link to={createPageUrl(algo.page)}>
                <div className="group relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10"
                    style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                  />
                  <div className="relative h-full bg-slate-950/95 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-2 shadow-2xl shadow-black/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${algo.color} mb-4`}>
                      <algo.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {algo.name}
                    </h3>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                      {algo.description}
                    </p>
                    
                    <div className="flex items-center text-blue-400 text-sm font-medium">
                      Explore
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}