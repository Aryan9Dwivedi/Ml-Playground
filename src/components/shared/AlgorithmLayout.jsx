import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AlgorithmLayout({ 
  title, 
  description, 
  icon: Icon, 
  color,
  children,
  theory
}) {
  const [showTheory, setShowTheory] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-black/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
              <div className="h-8 w-px bg-slate-700" />
              <div className={`p-2 rounded-lg bg-gradient-to-r ${color} shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                <p className="text-sm text-slate-400">{description}</p>
              </div>
            </div>
            
            {theory && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTheory(!showTheory)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 shadow-lg"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {showTheory ? 'Hide' : 'Show'} Theory
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Theory Panel */}
      {showTheory && theory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="prose prose-invert prose-sm max-w-none">
              {theory}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}