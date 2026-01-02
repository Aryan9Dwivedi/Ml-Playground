import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Tooltip from './Tooltip';

export default function MetricsDisplay({ metrics }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric, index) => {
        const TrendIcon = metric.trend === 'up' ? TrendingUp : 
                         metric.trend === 'down' ? TrendingDown : Minus;
        const trendColor = metric.trend === 'up' ? 'text-emerald-400' :
                          metric.trend === 'down' ? 'text-rose-400' : 'text-slate-400';
        
        const content = (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all shadow-2xl shadow-black/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-mono">
                  {typeof metric.value === 'number' ? metric.value.toFixed(metric.decimals || 4) : metric.value}
                </p>
                {metric.description && (
                  <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
                )}
              </div>
              {metric.trend && (
                <TrendIcon className={`w-5 h-5 ${trendColor}`} />
              )}
            </div>
          </motion.div>
        );
        
        return metric.tooltip ? (
          <Tooltip key={metric.label} content={metric.tooltip}>
            {content}
          </Tooltip>
        ) : content;
      })}
    </div>
  );
}