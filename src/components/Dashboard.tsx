/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="glass-panel p-5 rounded-xl border-slate-800">
    <div className="flex justify-between items-start mb-3">
      <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">{title}</p>
      <div className={`p-2 rounded-lg ${color === 'primary' ? 'bg-primary/10' : `bg-${color}-500/10`}`}>
        <Icon className={`w-4 h-4 ${color === 'primary' ? 'text-primary' : `text-${color}-500`}`} />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <h2 className="text-2xl font-medium text-white tracking-tight">{value}</h2>
      {trend && (
        <span className={`text-[10px] font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </span>
      )}
    </div>
  </div>
);

export const Dashboard = () => {
  const { products, transactions, formatCurrency } = useApp();

  const stats = useMemo(() => {
    const totalSales = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalProfit = transactions.reduce((acc, t) => acc + t.totalProfit, 0);
    const lowStockCount = products.filter(p => p.stock < 5).length;
    const totalProducts = products.length;

    return { totalSales, totalProfit, lowStockCount, totalProducts };
  }, [products, transactions]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayTransactions = transactions.filter(t => isSameDay(new Date(t.date), date));
      const amount = dayTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
      return {
        name: format(date, 'EEE'),
        amount,
      };
    });
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Daily Revenue" 
          value={formatCurrency(stats.totalSales)} 
          icon={DollarSign} 
          color="emerald"
          trend="up"
          trendValue="12%"
        />
        <StatCard 
          title="Monthly Profit" 
          value={formatCurrency(stats.totalProfit)} 
          icon={TrendingUp} 
          color="primary" 
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={`${stats.lowStockCount} Items`} 
          icon={AlertTriangle} 
          color="orange" 
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={Package} 
          color="slate" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-panel p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="font-medium text-white">Revenue Performance</h3>
            <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg">
               <button className="text-[10px] font-medium text-white uppercase px-3 py-1 bg-primary rounded-md shadow-sm">7D</button>
               <button className="text-[10px] font-medium text-slate-400 uppercase px-3 py-1 hover:text-slate-200">30D</button>
            </div>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0000" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF0000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d24', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#FF0000', fontSize: '12px' }}
                  labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
                  cursor={{ stroke: '#1e293b' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#FF0000" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories / Breakdown */}
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="font-medium text-white mb-6">Sales by Category</h3>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
             {[
               { name: 'Laptops & PC', color: 'bg-primary', width: 'w-[45%]', pct: '45%' },
               { name: 'CCTV Systems', color: 'bg-indigo-500', width: 'w-[30%]', pct: '30%' },
               { name: 'Accessories', color: 'bg-emerald-500', width: 'w-[25%]', pct: '25%' }
             ].map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs items-center mb-1">
                    <span className="text-slate-400 font-medium">{cat.name}</span>
                    <span className="text-white font-medium">{cat.pct}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", cat.color, cat.width)} />
                  </div>
                </div>
             ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800">
             <button className="w-full btn-primary text-xs tracking-wider uppercase font-medium">
                Generate Full Report
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
