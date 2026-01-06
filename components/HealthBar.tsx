import React from 'react';

interface HealthBarProps {
  label: string;
  value: number;
  isPlayer?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({ label, value, isPlayer = true }) => {
  const percentage = Math.max(0, Math.min(100, value));
  
  return (
    <div className="flex flex-col gap-2 rounded-lg p-4 bg-surface-dark border border-[#5a4d2b] w-full">
      <div className={`flex justify-between items-end ${!isPlayer ? 'flex-row-reverse' : ''}`}>
        <p className="text-white text-sm font-bold uppercase tracking-wider">{label}</p>
        <p className={`${isPlayer ? 'text-primary' : 'text-[#fa4238]'} text-xl font-bold leading-none`}>
          {percentage.toFixed(0)}%
        </p>
      </div>
      <div className={`w-full bg-black/30 h-3 rounded-full overflow-hidden flex ${!isPlayer ? 'justify-end' : ''}`}>
        <div 
          className={`h-full w-full transition-all duration-300 ease-out ${
            isPlayer 
              ? 'bg-gradient-to-r from-primary to-yellow-300 origin-left' 
              : 'bg-gradient-to-l from-[#fa4238] to-red-400 origin-right'
          }`}
          style={{ transform: `scaleX(${percentage / 100})` }}
        ></div>
      </div>
    </div>
  );
};
