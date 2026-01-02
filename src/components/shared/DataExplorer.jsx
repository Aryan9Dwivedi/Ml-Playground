import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Info } from 'lucide-react';
import { InfoIcon } from './Tooltip';
import { Button } from '@/components/ui/button';

export default function DataExplorer({ data, features = ['x', 'y'], classColors, onDatasetChange, availableDatasets }) {
  const [activeView, setActiveView] = useState('scatter');
  
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const result = {};
    features.forEach(feature => {
      const values = data.map(d => d[feature]).filter(v => v !== undefined);
      result[feature] = {
        min: Math.min(...values),
        max: Math.max(...values),
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
      };
    });
    
    if (data[0]?.class !== undefined) {
      const classCounts = {};
      data.forEach(d => {
        classCounts[d.class] = (classCounts[d.class] || 0) + 1;
      });
      result.classes = classCounts;
    }
    
    return result;
  }, [data, features]);
  
  const renderScatterPlot = () => {
    const xFeature = features[0] || 'x';
    const yFeature = features[1] || 'y';
    const xValues = data.map(d => d[xFeature]);
    const yValues = data.map(d => d[yFeature]);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    return (
      <svg width={400} height={300} className="bg-slate-950 rounded-lg">
        {/* Grid */}
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i}>
            <line x1={50 + i * 70} y1={30} x2={50 + i * 70} y2={250} stroke="#334155" strokeWidth={1} opacity={0.3} />
            <line x1={50} y1={30 + i * 55} x2={330} y2={30 + i * 55} stroke="#334155" strokeWidth={1} opacity={0.3} />
          </g>
        ))}
        
        {/* Axes */}
        <line x1={50} y1={250} x2={330} y2={250} stroke="#475569" strokeWidth={2} />
        <line x1={50} y1={30} x2={50} y2={250} stroke="#475569" strokeWidth={2} />
        
        {/* Points */}
        {data.map((d, i) => {
          const x = 50 + ((d[xFeature] - xMin) / (xMax - xMin)) * 280;
          const y = 250 - ((d[yFeature] - yMin) / (yMax - yMin)) * 220;
          const color = classColors?.[d.class] || '#3b82f6';
          
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill={color}
              stroke="#fff"
              strokeWidth={1.5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.01 }}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          );
        })}
        
        {/* Labels */}
        <text x={190} y={280} textAnchor="middle" fill="#64748b" fontSize={12}>{xFeature}</text>
        <text x={20} y={140} textAnchor="middle" fill="#64748b" fontSize={12} transform="rotate(-90, 20, 140)">{yFeature}</text>
      </svg>
    );
  };
  
  const renderHistogram = () => {
    const feature = features[0] || 'x';
    const values = data.map(d => d[feature]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 15;
    const binWidth = (max - min) / bins;
    
    const histogram = Array(bins).fill(0);
    values.forEach(v => {
      const binIndex = Math.min(Math.floor((v - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });
    
    const maxCount = Math.max(...histogram);
    
    return (
      <svg width={400} height={300} className="bg-slate-950 rounded-lg">
        <text x={200} y={20} textAnchor="middle" fill="#94a3b8" fontSize={14} fontWeight="bold">
          Distribution of {feature}
        </text>
        
        {histogram.map((count, i) => {
          const barHeight = (count / maxCount) * 220;
          const x = 30 + i * (340 / bins);
          
          return (
            <g key={i}>
              <motion.rect
                x={x}
                y={260 - barHeight}
                width={340 / bins - 2}
                height={barHeight}
                fill="#3b82f6"
                initial={{ height: 0, y: 260 }}
                animate={{ height: barHeight, y: 260 - barHeight }}
                transition={{ delay: i * 0.02 }}
              />
              <text x={x + (340 / bins - 2) / 2} y={275} textAnchor="middle" fill="#64748b" fontSize={9}>
                {(min + i * binWidth).toFixed(1)}
              </text>
            </g>
          );
        })}
        
        <line x1={30} y1={260} x2={370} y2={260} stroke="#475569" strokeWidth={2} />
      </svg>
    );
  };
  
  const renderClassDistribution = () => {
    if (!stats?.classes) return null;
    
    const classes = Object.entries(stats.classes);
    const total = data.length;
    
    return (
      <svg width={400} height={300} className="bg-slate-950 rounded-lg">
        <text x={200} y={20} textAnchor="middle" fill="#94a3b8" fontSize={14} fontWeight="bold">
          Class Distribution
        </text>
        
        {classes.map(([cls, count], i) => {
          const barHeight = (count / total) * 220;
          const x = 100 + i * 80;
          const color = classColors?.[parseInt(cls)] || '#3b82f6';
          
          return (
            <g key={cls}>
              <motion.rect
                x={x}
                y={260 - barHeight}
                width={60}
                height={barHeight}
                fill={color}
                initial={{ height: 0, y: 260 }}
                animate={{ height: barHeight, y: 260 - barHeight }}
                transition={{ delay: i * 0.1 }}
                rx={4}
              />
              <text x={x + 30} y={245 - barHeight} textAnchor="middle" fill={color} fontSize={14} fontWeight="bold">
                {count}
              </text>
              <text x={x + 30} y={275} textAnchor="middle" fill="#94a3b8" fontSize={12}>
                Class {cls}
              </text>
              <text x={x + 30} y={290} textAnchor="middle" fill="#64748b" fontSize={10}>
                {((count / total) * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
    );
  };
  
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Data Explorer</h3>
          <InfoIcon content="Explore your dataset visually. Understand distributions, relationships, and class balance before training." />
        </div>
        
        {availableDatasets && (
          <select
            onChange={(e) => onDatasetChange?.(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm text-white"
          >
            {availableDatasets.map(ds => (
              <option key={ds.id} value={ds.id}>{ds.name}</option>
            ))}
          </select>
        )}
      </div>
      
      {/* View Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={activeView === 'scatter' ? 'default' : 'outline'}
          onClick={() => setActiveView('scatter')}
          className={activeView === 'scatter' ? 'bg-cyan-600' : 'border-slate-700'}
        >
          Scatter Plot
        </Button>
        <Button
          size="sm"
          variant={activeView === 'histogram' ? 'default' : 'outline'}
          onClick={() => setActiveView('histogram')}
          className={activeView === 'histogram' ? 'bg-cyan-600' : 'border-slate-700'}
        >
          Histogram
        </Button>
        {stats?.classes && (
          <Button
            size="sm"
            variant={activeView === 'classes' ? 'default' : 'outline'}
            onClick={() => setActiveView('classes')}
            className={activeView === 'classes' ? 'bg-cyan-600' : 'border-slate-700'}
          >
            Classes
          </Button>
        )}
      </div>
      
      {/* Visualization */}
      <div className="flex justify-center mb-4">
        {activeView === 'scatter' && renderScatterPlot()}
        {activeView === 'histogram' && renderHistogram()}
        {activeView === 'classes' && renderClassDistribution()}
      </div>
      
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map(feature => {
            if (!stats[feature]) return null;
            return (
              <div key={feature} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1 uppercase">{feature}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Range:</span>
                    <span className="text-cyan-400 font-mono">[{stats[feature].min.toFixed(2)}, {stats[feature].max.toFixed(2)}]</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mean:</span>
                    <span className="text-white font-mono">{stats[feature].mean.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}