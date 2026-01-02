import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnhancedDataCanvas({ 
  data, 
  width = 600, 
  height = 400, 
  onAddPoint,
  onRemovePoint,
  overlayRender,
  showGrid = true,
  pointRadius = 6,
  animatePoints = true,
  glowEffect = true
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  
  const margin = 60;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;
  
  const scaleX = (x) => margin + x * plotWidth;
  const scaleY = (y) => height - margin - y * plotHeight;
  const unscaleX = (x) => (x - margin) / plotWidth;
  const unscaleY = (y) => (height - margin - y) / plotHeight;
  
  const handleClick = (e) => {
    if (!onAddPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = unscaleX(e.clientX - rect.left);
    const y = unscaleY(e.clientY - rect.top);
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      onAddPoint(x, y);
    }
  };
  
  const handleRightClick = (e, index) => {
    e.preventDefault();
    if (onRemovePoint) onRemovePoint(index);
  };
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = unscaleX(e.clientX - rect.left);
    const y = unscaleY(e.clientY - rect.top);
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      setMousePos({ x, y });
    } else {
      setMousePos(null);
    }
  };
  
  const getPointColor = (point) => {
    if (point.color) return point.color;
    if (point.class === 0) return '#3b82f6';
    if (point.class === 1) return '#8b5cf6';
    if (point.class === 2) return '#10b981';
    return '#f59e0b';
  };
  
  return (
    <div className="relative">
      <svg 
        width={width} 
        height={height} 
        className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-slate-800 shadow-2xl shadow-black/50 cursor-crosshair" 
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos(null)}
      >
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
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated grid background */}
        {showGrid && (
          <g opacity="0.15">
            {Array.from({ length: 11 }).map((_, i) => (
              <React.Fragment key={i}>
                <motion.line
                  x1={margin + (i / 10) * plotWidth}
                  y1={margin}
                  x2={margin + (i / 10) * plotWidth}
                  y2={height - margin}
                  stroke="#475569"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: i * 0.02 }}
                />
                <motion.line
                  x1={margin}
                  y1={margin + (i / 10) * plotHeight}
                  x2={width - margin}
                  y2={margin + (i / 10) * plotHeight}
                  stroke="#475569"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: i * 0.02 }}
                />
              </React.Fragment>
            ))}
          </g>
        )}
        
        {/* Axes with glow */}
        <line x1={margin} y1={height - margin} x2={width - margin} y2={height - margin} stroke="#64748b" strokeWidth="3" filter="url(#glow)" />
        <line x1={margin} y1={margin} x2={margin} y2={height - margin} stroke="#64748b" strokeWidth="3" filter="url(#glow)" />
        
        {/* Axis labels */}
        <text x={width / 2} y={height - 15} textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="600">X₁</text>
        <text x={20} y={height / 2} textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="600" transform={`rotate(-90, 20, ${height / 2})`}>X₂</text>
        
        {/* Custom overlay (e.g., decision boundary, regression line) */}
        {overlayRender && overlayRender({ scaleX, scaleY, width, height, margin, plotWidth, plotHeight })}
        
        {/* Mouse cursor indicator */}
        {mousePos && onAddPoint && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <circle cx={scaleX(mousePos.x)} cy={scaleY(mousePos.y)} r={pointRadius + 4} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx={scaleX(mousePos.x)} cy={scaleY(mousePos.y)} r={pointRadius} fill="#3b82f6" opacity="0.3" />
          </motion.g>
        )}
        
        {/* Data points with enhanced animations */}
        {data.map((point, index) => {
          const cx = scaleX(point.x1);
          const cy = scaleY(point.x2);
          const color = getPointColor(point);
          const isHovered = hoveredPoint === index;
          
          return (
            <g 
              key={index}
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
              onContextMenu={(e) => handleRightClick(e, index)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow effect */}
              {glowEffect && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={pointRadius * 2.5}
                  fill={color}
                  opacity={isHovered ? 0.4 : 0.2}
                  filter="url(#strongGlow)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isHovered ? 1.2 : 1, 
                    opacity: isHovered ? 0.5 : 0.25 
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              {/* Outer ring on hover */}
              {isHovered && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={pointRadius + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              {/* Main point */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={pointRadius}
                fill={color}
                stroke="#fff"
                strokeWidth={isHovered ? 3 : 2}
                filter="url(#glow)"
                initial={animatePoints ? { scale: 0, opacity: 0 } : {}}
                animate={{ 
                  scale: isHovered ? 1.3 : 1, 
                  opacity: 1 
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 20,
                  delay: animatePoints ? index * 0.02 : 0 
                }}
                style={{ 
                  transformOrigin: `${cx}px ${cy}px`,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' 
                }}
              />
              
              {/* Tooltip on hover */}
              {isHovered && (
                <motion.g
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <rect
                    x={cx - 40}
                    y={cy - pointRadius - 35}
                    width="80"
                    height="28"
                    rx="6"
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth="2"
                    filter="url(#glow)"
                  />
                  <text
                    x={cx}
                    y={cy - pointRadius - 21}
                    textAnchor="middle"
                    fill={color}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ({point.x1.toFixed(2)}, {point.x2.toFixed(2)})
                  </text>
                  <text
                    x={cx}
                    y={cy - pointRadius - 10}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    Class: {point.class}
                  </text>
                </motion.g>
              )}
              
              {/* Pulsing animation for new points */}
              {animatePoints && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={pointRadius}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ 
                    duration: 1, 
                    delay: index * 0.02,
                    repeat: 0 
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      {data.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {Array.from(new Set(data.map(d => d.class))).sort().map(cls => (
            <motion.div
              key={cls}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: cls * 0.1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-lg border border-slate-700"
            >
              <div className="relative">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPointColor({ class: cls }) }} />
                <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: getPointColor({ class: cls }), opacity: 0.3 }} />
              </div>
              <span className="text-xs text-slate-300 font-medium">Class {cls}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}