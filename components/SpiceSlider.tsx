import React from 'react';
import { RoastConfig, RoastTone } from '../types';
import { Smile, Brain, Flame, Skull } from 'lucide-react';

interface SpiceSliderProps {
  level: RoastTone;
  onChange: (level: RoastTone) => void;
}

export const SpiceSlider: React.FC<SpiceSliderProps> = ({ level, onChange }) => {
  const tones: { id: RoastTone; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'playful', label: 'Playful', icon: <Smile size={18} />, color: 'text-green-400 border-green-500' },
    { id: 'witty', label: 'Witty', icon: <Brain size={18} />, color: 'text-blue-400 border-blue-500' },
    { id: 'savage', label: 'Savage', icon: <Flame size={18} />, color: 'text-roast-orange border-roast-orange' },
    { id: 'emotional_damage', label: 'Damage', icon: <Skull size={18} />, color: 'text-roast-red border-roast-red shadow-[0_0_15px_rgba(255,42,42,0.4)]' },
  ];

  return (
    <div className="flex flex-col gap-3 w-full max-w-xl mx-auto mb-4 px-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Select Tone</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {tones.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all duration-200 border ${
              level === t.id 
                ? `bg-gray-800 ${t.color}` 
                : 'bg-roast-card/50 border-transparent text-gray-500 hover:bg-gray-800 hover:text-gray-300'
            }`}
          >
            <div className={`mb-1 ${level === t.id ? '' : 'opacity-50'}`}>
                {t.icon}
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};