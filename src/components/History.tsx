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
  Receipt,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { ReceiptModal } from './ReceiptModal';
import { Transaction } from '../types';

export const History = () => {
  const { transactions, formatCurrency, t } = useApp();
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

  return (
    <div className="space-y-4">
      {/* Table Header Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
         <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center border-white/5">
            <span className="label-caps mb-2">{t('turnover')}</span>
            <span className="text-2xl font-bold text-white font-mono tracking-tighter">{formatCurrency(transactions.reduce((acc, t) => acc + t.totalAmount, 0))}</span>
         </div>
         <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center border-primary/10">
            <span className="label-caps mb-2">{t('net_profit')}</span>
            <span className="text-2xl font-bold text-primary font-mono tracking-tighter">{formatCurrency(transactions.reduce((acc, t) => acc + t.totalProfit, 0))}</span>
         </div>
         <div className="glass-panel p-5 rounded-2xl flex flex-col justify-center sm:col-span-2 lg:col-span-1 border-slate-800/50">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
               <input type="text" placeholder={t('search_transactions')} className="input-field !pl-12 w-full text-sm font-medium h-12" />
            </div>
         </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-900/60 border-b border-white/5">
              <tr>
                <th className="px-6 py-5 label-caps">{t('date_time')}</th>
                <th className="px-6 py-5 label-caps">{t('customer')}</th>
                <th className="px-6 py-5 label-caps">{t('products_label')}</th>
                <th className="px-6 py-5 label-caps text-right">{t('amount')}</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
          <tbody className="text-sm divide-y divide-surface-border/50">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-800/10 transition-colors group">
                <td className="px-6 py-6 transition-all group-hover:bg-primary/5">
                  <div className="text-white font-bold text-sm tracking-tight">{format(transaction.date, 'dd MMM yyyy')}</div>
                  <div className="text-[10px] font-bold font-mono text-slate-600 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    {format(transaction.date, 'HH:mm')} • <span className="text-primary/60">ID:{transaction.id.slice(0, 6)}</span>
                  </div>
                </td>
                <td className="px-6 py-6 transition-all group-hover:bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-500 shadow-inner group-hover:border-primary/30 transition-all">
                      {(transaction.customerName || 'U')[0]}
                    </div>
                    <span className="text-slate-300 font-bold text-sm group-hover:text-white transition-colors">{transaction.customerName || t('walk_in_customer')}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {transaction.items.map((item, idx) => (
                      <span key={idx} className="text-xs bg-slate-800/50 px-2 py-0.5 rounded-md text-slate-400 border border-slate-700/30 group-hover:border-slate-600/50 transition-colors">
                        {item.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="text-white font-medium font-mono text-base">{formatCurrency(transaction.totalAmount)}</div>
                  <div className="text-xs text-primary font-medium mt-1 uppercase tracking-tight flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {t('profit')}: {formatCurrency(transaction.totalProfit)}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => setSelectedTransaction(transaction)}
                    className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title={t('print_receipt')}
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {transactions.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-5 text-primary" />
            <p className="text-sm font-medium">{t('no_sales_recorded')}</p>
          </div>
        )}
      </div>
     </div>

      <ReceiptModal 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </div>
  );
};
