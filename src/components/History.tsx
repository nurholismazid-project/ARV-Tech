/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Search, 
  User, 
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { format } from 'date-fns';

export const History = () => {
  const { transactions, formatCurrency } = useApp();

  return (
    <div className="space-y-4">
      {/* Table Header Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
         <div className="glass-panel p-4 md:p-5 rounded-2xl flex flex-col justify-center border-emerald-500/10">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">Turnover</span>
            <span className="text-lg md:text-xl font-bold text-white font-mono">{formatCurrency(transactions.reduce((acc, t) => acc + t.totalAmount, 0))}</span>
         </div>
         <div className="glass-panel p-4 md:p-5 rounded-2xl flex flex-col justify-center border-primary/10">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">Net Profit</span>
            <span className="text-lg md:text-xl font-bold text-primary font-mono">{formatCurrency(transactions.reduce((acc, t) => acc + t.totalProfit, 0))}</span>
         </div>
         <div className="glass-panel p-4 md:p-5 rounded-2xl flex flex-col justify-center sm:col-span-2 lg:col-span-1 border-slate-800/50">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input type="text" placeholder="Search transactions..." className="input-field pl-10 w-full text-xs h-10" />
            </div>
         </div>
      </div>

      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-[#0b0d11]/50 text-slate-500 text-[10px] uppercase font-medium border-b border-surface-border">
            <tr>
              <th className="px-6 py-4">Date / Time</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-surface-border/50">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-800/10 transition-colors group">
                <td className="px-6 py-5">
                  <div className="text-white font-medium">{format(transaction.date, 'dd MMM yyyy')}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase opacity-60">
                    {format(transaction.date, 'HH:mm')} • <span className="text-slate-400">ID:{transaction.id.slice(0, 6)}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-surface-border flex items-center justify-center text-xs font-medium text-slate-400 shadow-inner">
                      {(transaction.customerName || 'U')[0]}
                    </div>
                    <span className="text-slate-300 font-medium">{transaction.customerName || 'Walk-in Customer'}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {transaction.items.map((item, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800/50 px-2 py-0.5 rounded-md text-slate-400 border border-slate-700/30 group-hover:border-slate-600/50 transition-colors">
                        {item.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="text-white font-medium font-mono text-base">{formatCurrency(transaction.totalAmount)}</div>
                  <div className="text-[10px] text-emerald-500 font-medium mt-1 uppercase tracking-tight flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Profit: {formatCurrency(transaction.totalProfit)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {transactions.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-5 text-primary" />
            <p className="text-sm font-medium">No sales recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
