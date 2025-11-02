import React from 'react';

interface MetricIndicatorProps {
  label: string;
  value: number; // 0-100
  className?: string;
}

export const MetricIndicator: React.FC<MetricIndicatorProps> = ({ label, value, className = '' }) => {
  const getColorClass = (val: number) => {
    if (val >= 80) return 'bg-green-500';
    if (val >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-linkedin-text">{label}</span>
        <span className="text-sm font-semibold text-linkedin-blue">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${getColorClass(value)} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};