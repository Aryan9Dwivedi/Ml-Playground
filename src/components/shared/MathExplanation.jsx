import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Calculator, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MathExplanation({ title, steps, example, intuition }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-gradient-to-br from-blue-950/30 to-indigo-950/30 backdrop-blur-sm border border-blue-800/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-blue-900/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-xs text-slate-400">Click to see step-by-step explanation</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Intuition */}
              {intuition && (
                <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-purple-400 mt-0.5" />
                    <h5 className="text-sm font-semibold text-purple-300">Intuition</h5>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{intuition}</p>
                </div>
              )}
              
              {/* Steps */}
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 mb-1">{step.text}</p>
                      {step.formula && (
                        <div className="bg-slate-900/50 rounded-lg p-3 font-mono text-sm text-blue-300 overflow-x-auto">
                          {step.formula}
                        </div>
                      )}
                      {step.explanation && (
                        <p className="text-xs text-slate-400 mt-1 italic">{step.explanation}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Example */}
              {example && (
                <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <h5 className="text-sm font-semibold text-emerald-300">Worked Example</h5>
                  </div>
                  <div className="text-sm text-slate-300 space-y-2">
                    {example.map((line, i) => (
                      <div key={i} className="font-mono text-xs bg-slate-900/30 rounded p-2">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}