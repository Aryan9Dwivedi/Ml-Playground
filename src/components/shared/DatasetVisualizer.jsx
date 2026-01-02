import React from 'react';
import { motion } from 'framer-motion';
import { Database, Info } from 'lucide-react';
import { InfoIcon } from './Tooltip';

export default function DatasetVisualizer({ data, classColors, title = "Training Dataset" }) {
  const classCounts = data.reduce((acc, d) => {
    acc[d.class] = (acc[d.class] || 0) + 1;
    return acc;
  }, {});
  
  const stats = {
    total: data.length,
    classes: Object.keys(classCounts).length,
    balanced: Math.max(...Object.values(classCounts)) / Math.min(...Object.values(classCounts)) < 1.5
  };
  
  return (
    <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-4 h-4 text-cyan-400" />
        <h4 className="text-sm font-medium text-slate-400">{title}</h4>
        <InfoIcon content="Overview of the data the algorithm is learning from. Balanced classes (similar counts) lead to better learning." />
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
          <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-1">Total Samples</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
          <div className="text-2xl font-bold text-purple-400">{stats.classes}</div>
          <div className="text-xs text-slate-400 mt-1">Classes</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
          <div className="text-2xl font-bold text-emerald-400">{stats.balanced ? '✓' : '⚠'}</div>
          <div className="text-xs text-slate-400 mt-1">{stats.balanced ? 'Balanced' : 'Imbalanced'}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        {Object.entries(classCounts).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([cls, count]) => (
          <div key={cls}>
            <div className="flex justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: classColors[parseInt(cls)] }} />
                <span className="text-slate-300 font-medium">Class {cls}</span>
              </div>
              <span className="font-mono font-bold" style={{ color: classColors[parseInt(cls)] }}>
                {count} samples ({((count / stats.total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <motion.div
                className="h-full"
                style={{ backgroundColor: classColors[parseInt(cls)] }}
                initial={{ width: 0 }}
                animate={{ width: `${(count / stats.total) * 100}%` }}
                transition={{ duration: 0.5, delay: parseInt(cls) * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}