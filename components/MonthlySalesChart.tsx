import React from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface MonthlySalesChartProps {
  salesData: { [key: string]: number };
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ salesData }) => {
  const monthMap: { [key: string]: number } = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
  };

  // FIX: Replaced Object.entries() with Object.keys().map() to ensure correct type inference.
  // This resolves an issue where TypeScript was incorrectly inferring the value type of salesData as 'unknown'.
  const sortedMonths: [string, number][] = Object.keys(salesData)
    .map((key): [string, number] => [key, salesData[key]])
    .sort((a, b) => {
      const [monthStrA, yearA] = a[0].split(' de ');
      const [monthStrB, yearB] = b[0].split(' de ');
      const monthA = monthMap[monthStrA.toLowerCase() as keyof typeof monthMap];
      const monthB = monthMap[monthStrB.toLowerCase() as keyof typeof monthMap];
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      return monthA - monthB;
    });

  if (sortedMonths.length === 0) {
    return null;
  }

  const maxValue = Math.max(...sortedMonths.map(([, value]) => value));

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <ChartBarIcon className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-slate-100">Vendas Mensais</h3>
      </div>
      <div className="flex justify-around items-end h-64 gap-2 md:gap-4 border-l border-b border-slate-700 p-1">
        {sortedMonths.map(([month, value]) => {
          const barHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const shortMonth = month.split(' ')[0].substring(0, 3);
          return (
            <div key={month} className="flex flex-col items-center justify-end h-full w-full group relative">
                <div className="absolute -top-6 hidden group-hover:block bg-slate-600 text-white text-xs rounded py-1 px-2">
                  {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              <div
                className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-t-md transition-all duration-300"
                style={{ height: `${barHeight}%` }}
              ></div>
              <p className="text-xs text-slate-400 mt-2 text-center whitespace-nowrap pt-1">
                {shortMonth}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlySalesChart;