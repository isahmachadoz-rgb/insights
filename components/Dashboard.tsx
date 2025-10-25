
import React from 'react';
import { SalesMetrics } from '../types';
import MetricCard from './MetricCard';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { TagIcon } from './icons/TagIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { FolderIcon } from './icons/FolderIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import MonthlySalesChart from './MonthlySalesChart';

interface DashboardProps {
  metrics: SalesMetrics | null;
  hasFiles: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, hasFiles }) => {
  if (!hasFiles) {
    return (
        <div className="bg-slate-800 rounded-lg p-8 text-center flex flex-col items-center justify-center h-full border border-slate-700">
            <ChartBarIcon className="w-16 h-16 text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-slate-300">Bem-vindo ao Sales Dashboard</h2>
            <p className="text-slate-400">Adicione uma ou mais planilhas acima para visualizar as métricas de vendas.</p>
        </div>
    );
  }

  if (!metrics) {
    return (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-2 text-slate-300">Processando dados...</h2>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-100">Painel de Métricas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard
                  title="Vendas Totais"
                  value={metrics.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  icon={<DollarSignIcon />}
                  description={`Analisado em ${metrics.analyzedPeriods.length} ${metrics.analyzedPeriods.length > 1 ? 'períodos' : 'período'}`}
              />
              <MetricCard
                  title="Ticket Médio"
                  value={metrics.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  icon={<ShoppingCartIcon />}
                  description="Valor médio por transação"
              />
              <MetricCard
                  title="Variação Mês a Mês"
                  value={`${metrics.monthOverMonthChange.toFixed(1)}%`}
                  icon={<TrendingUpIcon positive={metrics.monthOverMonthChange >= 0} />}
                  description="Em relação ao mês anterior"
              />
              <MetricCard
                  title="Produto Mais Vendido"
                  value={metrics.bestSellingProduct}
                  icon={<TagIcon />}
                  description="Produto com mais unidades vendidas"
              />
              <MetricCard
                  title="Categoria de Maior Receita"
                  value={metrics.highestRevenueCategory}
                  icon={<FolderIcon />}
                  description="Categoria com maior faturamento"
              />
               <MetricCard
                  title="Região Mais Lucrativa"
                  value={metrics.mostProfitableRegion}
                  icon={<MapPinIcon />}
                  description="Região com maior faturamento"
              />
              <MetricCard
                  title="Mês de Melhor Venda"
                  value={metrics.bestMonth}
                  icon={<CalendarIcon />}
                  description="Mês com maior faturamento"
              />
          </div>
        </div>
        <MonthlySalesChart salesData={metrics.salesByMonth} />
    </div>
  );
};

export default Dashboard;
