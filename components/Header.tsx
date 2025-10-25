
import React from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold text-slate-100">
              Alpha Insights <span className="text-cyan-400">|</span> Sales Dashboard
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
