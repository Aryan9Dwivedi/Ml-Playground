import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2 } from 'lucide-react';
import Tooltip, { InfoIcon } from './Tooltip';

export default function HyperparameterPanel({ params, onChange, title = "Hyperparameters" }) {
  const handleChange = (key, value) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Settings2 className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="font-semibold text-white">{title}</h3>
        <InfoIcon content="Adjust these parameters to see how they affect the algorithm's behavior in real-time. Each parameter influences the learning process differently." />
      </div>
      
      <div className="space-y-5">
        {Object.entries(params).map(([key, config]) => {
          if (config.type === 'slider') {
            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm text-slate-300">{config.label}</Label>
                    {config.description && <InfoIcon content={config.description} />}
                  </div>
                  <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {config.value.toFixed(config.decimals || 0)}
                  </span>
                </div>
                <Slider
                  value={[config.value]}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  onValueChange={([v]) => handleChange(key, { ...config, value: v })}
                  className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:ring-2 [&_[role=slider]]:ring-blue-400/30"
                  onFocus={(e) => e.target.blur()}
                />
              </div>
            );
          }
          
          if (config.type === 'switch') {
            return (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm text-slate-300">{config.label}</Label>
                  {config.description && <InfoIcon content={config.description} />}
                </div>
                <Switch
                  checked={config.value}
                  onCheckedChange={(v) => handleChange(key, { ...config, value: v })}
                />
              </div>
            );
          }
          
          if (config.type === 'select') {
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm text-slate-300">{config.label}</Label>
                  {config.description && <InfoIcon content={config.description} />}
                </div>
                <Select
                  value={config.value}
                  onValueChange={(v) => handleChange(key, { ...config, value: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {config.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-slate-700">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }
          
          return null;
        })}
      </div>
    </div>
  );
}