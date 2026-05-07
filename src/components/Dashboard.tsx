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
  ArrowDownRight,
  CreditCard
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

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, description }: any) => (
  <div className="glass-panel p-5 rounded-xl border-slate-800/10">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="label-caps">{title}</p>
        {description && <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{description}</p>}
      </div>
      <div className={cn(
        "p-2 rounded-xl transition-colors",
        color === 'primary' ? 'bg-primary/10 text-primary' : `bg-${color}-500/10 text-${color}-500`
      )}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <h2 className="text-2xl font-bold text-white tracking-tight font-sans">{value}</h2>
      {trend && (
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
          trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
        )}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </span>
      )}
    </div>
  </div>
);

export const Dashboard = () => {
  const { products, transactions, expenses, formatCurrency, t } = useApp();

  const stats = useMemo(() => {
    const totalSales = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalProfit = transactions.reduce((acc, t) => acc + t.totalProfit, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const lowStockCount = products.filter(p => p.stock < 5).length;
    const totalProducts = products.length;

    return { totalSales, totalProfit, totalExpenses, lowStockCount, totalProducts };
  }, [products, transactions, expenses]);

  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(tx => {
      tx.items.forEach(item => {
        counts[item.productId] = (counts[item.productId] || 0) + item.quantity;
      });
    });

    return Object.entries(counts)
      .map(([id, qty]) => {
        const product = products.find(p => p.id === id);
        return { product, qty };
      })
      .filter(item => item.product)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
  }, [products, transactions]);

  const salesByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(tx => {
      tx.items.forEach(item => {
         const product = products.find(p => p.id === item.productId);
         if (product) {
            const itemRevenue = Number(item.totalPrice) || (Number(item.quantity) * Number(item.price)) || 0;
            categoryTotals[product.category] = (categoryTotals[product.category] || 0) + itemRevenue;
         }
      });
    });
    
    const totalRevenue = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const colors = ['bg-primary', 'bg-red-600', 'bg-rose-700', 'bg-red-800', 'bg-rose-900'];
    
    return Object.entries(categoryTotals)
      .map(([name, value], i) => ({
        name: t(`cat_${name}` as any),
        pct: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
        color: colors[i % colors.length]
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [products, transactions, t]);

  const lowStockItems = useMemo(() => {
    return products.filter(p => p.stock < 5).sort((a, b) => a.stock - b.stock).slice(0, 5);
  }, [products]);

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
          title={t('total_revenue' as any)} 
          value={formatCurrency(stats.totalSales)} 
          icon={DollarSign} 
          color="primary"
          trend="up"
          trendValue="12%"
        />
        <StatCard 
          title={t('monthly_profit')} 
          value={formatCurrency(stats.totalProfit - stats.totalExpenses)} 
          description={t('net_profit' as any)}
          icon={TrendingUp} 
          color="primary" 
        />
        <StatCard 
          title={t('expenses')} 
          value={formatCurrency(stats.totalExpenses)} 
          icon={CreditCard} 
          color="primary" 
        />
        <StatCard 
          title={t('total_products')} 
          value={stats.totalProducts} 
          icon={Package} 
          color="slate" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h3 className="heading-display">{t('revenue_performance')}</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">{t('last_7_days_activity') || 'Historical sales data analysis'}</p>
            </div>
            <div className="flex gap-1.5 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
               <button className="text-[10px] font-bold text-white uppercase tracking-widest px-4 py-1.5 bg-primary rounded-lg shadow-lg shadow-primary/20 transition-all">7D</button>
               <button className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-1.5 hover:text-slate-200 transition-colors">30D</button>
            </div>
          </div>
          <div className="min-h-[250px] md:min-h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d24', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#FF0000', fontSize: '14px' }}
                  labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
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

        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="heading-display">{t('product_inventory_summary')}</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Monitoring stock levels and pricing accuracy</p>
            </div>
            <button className="text-[10px] font-bold text-primary uppercase tracking-widest px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all">
              {t('view_all_products')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.03]">
                  <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">{t('product')}</th>
                  <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">{t('sell_price')}</th>
                  <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-center">{t('stock')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {products.slice(0, 6).map((product) => (
                  <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4">
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{product.name}</p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-0.5">{t(`cat_${product.category}` as any)}</p>
                    </td>
                    <td className="py-4 font-mono text-sm font-medium text-slate-300">
                      {formatCurrency(product.sellPrice)}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight",
                          product.stock < 5 ? "bg-[#FF0000]/10 text-[#FF0000]" : "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {product.stock} {t('unit')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-600 italic text-sm">
                      {t('no_product_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories & Top Products */}
        <div className="space-y-6">
           <div className="glass-panel p-6 flex flex-col">
              <h3 className="heading-display mb-8">{t('sales_by_category')}</h3>
              <div className="space-y-6 flex-1">
                 {salesByCategory.length > 0 ? salesByCategory.map((cat, i) => (
                    <div key={i} className="space-y-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="label-caps !text-slate-400">{cat.name}</span>
                        <span className="text-white font-bold text-sm font-mono">{cat.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", cat.color)} 
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                    </div>
                 )) : (
                    <p className="text-center text-slate-500 text-sm py-10 italic">{t('no_sales_data')}</p>
                 )}
              </div>
              
              <div className="mt-10 pt-10 border-t border-slate-800/50">
                 <h3 className="label-caps mb-6">{t('top_selling')}</h3>
                 <div className="space-y-5">
                    {topProducts.length > 0 ? topProducts.map((item: any, i) => (
                       <div key={i} className="flex items-center justify-between group cursor-default">
                          <div className="flex items-center gap-4">
                             <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/50 flex items-center justify-center text-[11px] text-slate-500 font-bold group-hover:border-primary/50 group-hover:text-primary transition-all">
                                0{i + 1}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate max-w-[140px]">{item.product.name}</p>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">{t(`cat_${item.product.category}` as any)}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-bold font-mono text-white whitespace-nowrap">{item.qty} <span className="text-slate-500 font-sans text-[10px] uppercase">{t('unit')}</span></p>
                             <div className="flex items-center justify-end gap-1 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-primary"></span>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-tight">{t('qty_sold')}</p>
                             </div>
                          </div>
                       </div>
                    )) : (
                       <div className="text-center py-6">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-5 text-slate-500" />
                          <p className="text-xs text-slate-600 italic">{t('no_sales_data')}</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Low Stock Watchlist */}
           {lowStockItems.length > 0 && (
              <div className="glass-panel p-6 border-rose-500/20 bg-rose-500/5">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-rose-500 flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4" />
                       {t('low_stock_alerts')}
                    </h3>
                    <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                       {lowStockItems.length}
                    </span>
                 </div>
                 <div className="space-y-4">
                    {lowStockItems.map((item) => (
                       <div key={item.id} className="flex justify-between items-center border-b border-rose-500/10 pb-3 last:border-0 last:pb-0">
                          <div>
                             <p className="text-sm font-medium text-white">{item.name}</p>
                             <p className="text-xs text-zinc-500 uppercase">{t(`cat_${item.category}` as any)}</p>
                          </div>
                          <div className="text-right leading-none">
                             <p className="text-sm font-bold text-[#FF0000]">{item.stock}</p>
                             <p className="text-xs text-[#FF0000]/60 uppercase">{t('unit')}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
