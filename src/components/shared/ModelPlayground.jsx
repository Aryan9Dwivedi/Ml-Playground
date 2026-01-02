import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, X, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InfoIcon } from './Tooltip';

export default function ModelPlayground({ models, onAddModel, onRemoveModel, selectedModel, onSelectModel }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (!models || models.length === 0) return null;
  
  const getBestModel = () => {
    return models.reduce((best, model) => 
      (model.score > best.score) ? model : best
    , models[0]);
  };
  
  const bestModel = getBestModel();
  
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Model Playground</h3>
          <InfoIcon content="Compare multiple models trained on the same data. Click a model to view its details and performance." />
        </div>
        {onAddModel && (
          <Button size="sm" onClick={onAddModel} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-1" />
            Add Model
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {models.map((model, index) => {
          const isSelected = selectedModel === index;
          const isBest = model === bestModel && models.length > 1;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectModel?.(index)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              {isBest && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1.5">
                  <Award className="w-3 h-3 text-white" />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold">{model.name || `Model ${index + 1}`}</h4>
                  <p className="text-xs text-slate-400 mt-1">{model.description}</p>
                </div>
                {onRemoveModel && models.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); onRemoveModel(index); }}
                    className="h-6 w-6 text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(model.metrics || {}).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-slate-500 mb-1 capitalize">{key}</div>
                    <div className="text-sm font-bold text-cyan-400">
                      {typeof value === 'number' ? value.toFixed(3) : value}
                    </div>
                  </div>
                ))}
              </div>
              
              {model.trained && (
                <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Trained
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {models.length > 1 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-semibold text-sm">Best Model</span>
          </div>
          <p className="text-xs text-slate-300">
            <strong>{bestModel.name || 'Model'}</strong> with score of <strong className="text-amber-400">{bestModel.score?.toFixed(3)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}