import React from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import Tooltip, { InfoIcon } from './Tooltip';

export default function FormulaDisplay({ title, formula, variables, highlighted, explanation }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-950/30 to-indigo-950/30 backdrop-blur-sm border border-blue-800/30 rounded-xl p-4 shadow-lg"
    >
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </h4>
          {explanation && <InfoIcon content={explanation} />}
        </div>
      )}
      
      <div className={`font-mono text-lg ${highlighted ? 'text-blue-300 font-semibold' : 'text-white'} overflow-x-auto bg-slate-900/50 rounded-lg p-3 border border-slate-700/50`}>
        {formula}
      </div>
      
      {variables && variables.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-800/20">
          <div className="text-xs text-slate-400 mb-2 font-semibold">Where:</div>
          <div className="space-y-1.5">
            {variables.map((v, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-slate-900/30 rounded px-2 py-1.5">
                <span className="font-mono font-semibold text-blue-300">{v.symbol}</span>
                <span className="text-slate-500">=</span>
                <span className="text-slate-200">{v.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}