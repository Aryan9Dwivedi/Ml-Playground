import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function StepNavigator({ 
  currentStep, 
  totalSteps, 
  isPlaying, 
  onPlay, 
  onPause, 
  onStepChange, 
  onReset,
  speed,
  onSpeedChange 
}) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">
          Step <span className="text-white font-mono">{currentStep}</span> of <span className="text-white font-mono">{totalSteps}</span>
        </span>
        
        {onSpeedChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Speed</span>
            <Slider
              value={[speed]}
              min={0.5}
              max={3}
              step={0.5}
              onValueChange={([v]) => onSpeedChange(v)}
              className="w-20 [&_[role=slider]]:bg-blue-500"
            />
            <span className="text-xs font-mono text-blue-400">{speed}x</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={isPlaying ? onPause : onPlay}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onStepChange(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep === totalSteps}
          className="text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="mt-4">
        <Slider
          value={[currentStep]}
          min={0}
          max={totalSteps}
          step={1}
          onValueChange={([v]) => onStepChange(v)}
          className="[&_[role=slider]]:bg-blue-500"
        />
      </div>
    </div>
  );
}