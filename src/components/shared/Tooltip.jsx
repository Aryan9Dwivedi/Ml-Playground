import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Info } from 'lucide-react';

export default function Tooltip({ children, content, side = "top" }) {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        side={side} 
        className="w-80 bg-slate-950 border border-slate-700 text-slate-100 shadow-2xl shadow-black/50" 
        sideOffset={8}
        style={{ zIndex: 999999, position: 'fixed' }}
        collisionPadding={20}
        avoidCollisions={true}
      >
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm leading-relaxed">{content}</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function InfoIcon({ content, side = "bottom" }) {
  return (
    <Tooltip content={content} side={side}>
      <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
        <Info className="w-3 h-3" />
      </button>
    </Tooltip>
  );
}