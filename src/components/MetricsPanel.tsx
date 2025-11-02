import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ChartBarIcon, FireIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface MetricGaugeProps {
  value: number;
  label: string;
  icon: React.ReactNode;
}

const MetricGauge: React.FC<MetricGaugeProps> = ({ value, label, icon }) => {
  const getColor = (val: number) => {
    if (val >= 80) return 'bg-gauge-high';
    if (val >= 60) return 'bg-gauge-medium';
    return 'bg-gauge-low';
  };

  return (
    <div className="group relative">
      <div className="metric-gauge">
        <div 
          className={`metric-gauge-fill ${getColor(value)}`}
          style={{ height: `${value}%` }}
        />
        <div className="relative z-10 flex flex-col items-center">
          {icon}
          <span className="text-lg font-bold">{value}%</span>
        </div>
      </div>
      <div className="tooltip">
        {label}
      </div>
    </div>
  );
};

export const MetricsPanel: React.FC<{ 
  engagement: number;
  impact: number;
  relevance: number;
}> = ({ engagement, impact, relevance }) => {
  return (
    <div className="card space-y-6">
      <h3 className="text-lg font-semibold">Metrics & Analytics</h3>
      
      <div className="flex justify-around">
        <MetricGauge 
          value={engagement} 
          label="Engagement Score"
          icon={<FireIcon className="w-6 h-6 text-gauge-medium mb-2" />}
        />
        <MetricGauge 
          value={impact} 
          label="Impact Potential"
          icon={<ChartBarIcon className="w-6 h-6 text-gauge-high mb-2" />}
        />
        <MetricGauge 
          value={relevance} 
          label="Audience Relevance"
          icon={<LightBulbIcon className="w-6 h-6 text-gauge-low mb-2" />}
        />
      </div>

      <div className="p-4 bg-linkedin-lighter dark:bg-linkedin-dark-border rounded-lg">
        <h4 className="font-medium mb-2">Quick Tips</h4>
        <ul className="text-sm space-y-2 text-linkedin-text/80">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gauge-high" />
            Add relevant hashtags to increase visibility
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gauge-medium" />
            Include a call-to-action for better engagement
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gauge-low" />
            Keep paragraphs short and scannable
          </li>
        </ul>
      </div>
    </div>
  );
};