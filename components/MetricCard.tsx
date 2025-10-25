
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, description }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 hover:border-cyan-500 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-slate-100">{value}</p>
        </div>
        <div className="bg-slate-700 p-3 rounded-md text-cyan-400">
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-4">{description}</p>
    </div>
  );
};

export default MetricCard;
