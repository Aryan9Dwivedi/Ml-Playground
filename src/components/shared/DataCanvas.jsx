import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export default function DataCanvas({ 
  points, 
  setPoints, 
  width = 600, 
  height = 400,
  showGrid = true,
  renderOverlay,
  xLabel = "X",
  yLabel = "Y",
  xRange = [0, 10],
  yRange = [0, 10],
  pointColors,
  readOnly = false,
  currentClass = 0
}) {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const scaleX = (x) => padding + ((x - xRange[0]) / (xRange[1] - xRange[0])) * chartWidth;
  const scaleY = (y) => height - padding - ((y - yRange[0]) / (yRange[1] - yRange[0])) * chartHeight;
  const unscaleX = (px) => ((px - padding) / chartWidth) * (xRange[1] - xRange[0]) + xRange[0];
  const unscaleY = (py) => ((height - padding - py) / chartHeight) * (yRange[1] - yRange[0]) + yRange[0];
  
  const handleClick = (e) => {
    if (readOnly) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    
    const x = unscaleX(px);
    const y = unscaleY(py);
    
    if (x >= xRange[0] && x <= xRange[1] && y >= yRange[0] && y <= yRange[1]) {
      setPoints([...points, { x, y, class: currentClass }]);
    }
  };
  
  const handleRightClick = (e, index) => {
    e.preventDefault();
    if (readOnly) return;
    
    const newPoints = [...points];
    newPoints.splice(index, 1);
    setPoints(newPoints);
  };
  
  const defaultColors = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];
  const colors = pointColors || defaultColors;
  
  return (
    <div className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
      {/* Instructions overlay */}
      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 max-w-xs z-10">
        <div className="flex items-start gap-2">
          <Info className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold text-white">Interactive Canvas:</span> Click to add points{!readOnly && ', right-click to remove'}
          </div>
        </div>
      </div>
      
      <svg
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        className="cursor-crosshair"
      >
        {/* Background with gradient */}
        <defs>
          <linearGradient id="canvasBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#canvasBg)" />
        
        {/* Grid */}
        {showGrid && (
          <g className="grid">
            {Array.from({ length: 11 }).map((_, i) => {
              const x = padding + (i / 10) * chartWidth;
              const y = padding + (i / 10) * chartHeight;
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                </g>
              );
            })}
          </g>
        )}
        
        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#475569"
          strokeWidth={2}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#475569"
          strokeWidth={2}
        />
        
        {/* Axis Labels */}
        <text
          x={width / 2}
          y={height - 8}
          textAnchor="middle"
          fill="#64748b"
          fontSize={12}
        >
          {xLabel}
        </text>
        <text
          x={12}
          y={height / 2}
          textAnchor="middle"
          fill="#64748b"
          fontSize={12}
          transform={`rotate(-90, 12, ${height / 2})`}
        >
          {yLabel}
        </text>
        
        {/* Axis Ticks */}
        {Array.from({ length: 6 }).map((_, i) => {
          const val = xRange[0] + (i / 5) * (xRange[1] - xRange[0]);
          const x = scaleX(val);
          return (
            <text
              key={`x-${i}`}
              x={x}
              y={height - padding + 20}
              textAnchor="middle"
              fill="#64748b"
              fontSize={10}
            >
              {val.toFixed(1)}
            </text>
          );
        })}
        {Array.from({ length: 6 }).map((_, i) => {
          const val = yRange[0] + (i / 5) * (yRange[1] - yRange[0]);
          const y = scaleY(val);
          return (
            <text
              key={`y-${i}`}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fill="#64748b"
              fontSize={10}
            >
              {val.toFixed(1)}
            </text>
          );
        })}
        
        {/* Custom overlay (regression lines, decision boundaries, etc.) */}
        {renderOverlay && renderOverlay({ scaleX, scaleY, chartWidth, chartHeight, padding, xRange, yRange })}
        
        {/* Data Points with glow effect */}
        {points.map((point, index) => (
          <g key={index}>
            {/* Glow effect */}
            {hoveredPoint === index && (
              <circle
                cx={scaleX(point.x)}
                cy={scaleY(point.y)}
                r={16}
                fill={colors[point.class % colors.length]}
                opacity={0.3}
                className="pointer-events-none"
              />
            )}
            <circle
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r={hoveredPoint === index ? 8 : 6}
              fill={colors[point.class % colors.length]}
              stroke="#fff"
              strokeWidth={hoveredPoint === index ? 3 : 2}
              className="cursor-pointer transition-all duration-200"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
              onContextMenu={(e) => handleRightClick(e, index)}
            />
            {hoveredPoint === index && (
              <>
                <rect
                  x={scaleX(point.x) - 35}
                  y={scaleY(point.y) - 30}
                  width={70}
                  height={18}
                  rx={4}
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth={1}
                  className="pointer-events-none"
                />
                <text
                  x={scaleX(point.x)}
                  y={scaleY(point.y) - 18}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={10}
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      {pointColors && (
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2">
          <div className="text-xs font-semibold text-slate-400 mb-1">Classes</div>
          <div className="flex gap-3">
            {pointColors.map((color, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-300">Class {i}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}