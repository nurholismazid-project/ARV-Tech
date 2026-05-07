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
import { cn } from '../lib/utils';
import { ReceiptModal } from './ReceiptModal';
import { Transaction } from '../types';

export const History = () => {
  const { transactions, formatCurrency, t } = useApp();
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

  return (
    <div className="space-y-4">
      {/* Table Header Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
         <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center border-surface-border">
            <span className="label-caps mb-2">{t('turnover')}</span>
            <span className="text-2xl font-bold text-text-heading font-mono tracking-tighter">{formatCurrency(transactions.reduce((acc, t) => acc + t.totalAmount, 0))}</span>
         </div>
         <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center border-primary/10">
            <span className="label-caps mb-2">{t('net_profit')}</span>
            <span className="text-2xl font-bold text-primary font-mono tracking-tighter">{formatCurrency(transactions.reduce((acc, t) => acc + t.totalProfit, 0))}</span>
         </div>
         <div className="glass-panel p-5 rounded-2xl flex flex-col justify-center sm:col-span-2 lg:col-span-1 border-surface-border transition-colors">
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                  <Search className="w-4 h-4" />
               </div>
               <input type="text" placeholder={t('search_transactions')} className="input-field !pl-14 w-full text-sm font-medium h-12 bg-surface-base" />
            </div>
         </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block glass-panel overflow-hidden rounded-2xl border-surface-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-base border-b border-surface-border transition-colors">
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
                <tr key={transaction.id} className="hover:bg-surface-base transition-colors group border-b border-surface-border/30 last:border-0">
                  <td className="px-6 py-6 transition-all group-hover:bg-primary/5">
                    <div className="text-text-heading font-bold text-sm tracking-tight">{format(transaction.date, 'dd MMM yyyy')}</div>
                    <div className="text-[10px] font-bold font-mono text-text-muted mt-1 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                      {format(transaction.date, 'HH:mm')} • <span className="text-primary/60">ID:{transaction.id.slice(0, 6)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 transition-all group-hover:bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-base border border-surface-border flex items-center justify-center text-xs font-bold text-text-muted shadow-inner group-hover:border-primary/30 transition-all">
                        {(transaction.customerName || 'U')[0]}
                      </div>
                      <span className="text-text-main font-bold text-sm group-hover:text-text-heading transition-colors">{transaction.customerName || t('walk_in_customer')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-text-muted">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {transaction.items.map((item, idx) => (
                        <span key={idx} className="text-xs bg-surface-base px-2 py-0.5 rounded-md text-text-muted border border-surface-border group-hover:border-text-muted/30 transition-colors">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="text-text-heading font-medium font-mono text-base">{formatCurrency(transaction.totalAmount)}</div>
                    <div className={cn(
                      "text-xs font-medium mt-1 uppercase tracking-tight flex items-center justify-end gap-1",
                      transaction.totalProfit > 0 ? "text-emerald-500" : transaction.totalProfit < 0 ? "text-rose-500" : "text-text-muted"
                    )}>
                      <TrendingUp className="w-3 h-3" />
                      {t('profit')}: {formatCurrency(transaction.totalProfit)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => setSelectedTransaction(transaction)}
                      className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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

      {/* Mobile Card List View */}
      <div className="lg:hidden space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="glass-panel p-5 border-surface-border space-y-4 transition-colors">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-text-muted" />
                  <span className="text-sm font-bold text-text-heading tracking-tight">{format(transaction.date, 'dd MMM yyyy, HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-base border border-surface-border flex items-center justify-center text-[10px] font-bold text-text-muted">
                    {(transaction.customerName || 'U')[0]}
                  </div>
                  <span className="text-xs text-text-muted font-medium">{transaction.customerName || t('walk_in_customer')}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTransaction(transaction)}
                className="p-2.5 bg-surface-base text-text-muted border border-surface-border rounded-xl active:scale-95 transition-all hover:text-primary"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 py-3 border-y border-surface-border transition-colors">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2.5 py-1 bg-surface-base rounded-lg border border-surface-border">
                  <span className="text-[11px] font-bold text-text-heading">{item.quantity}x</span>
                  <span className="text-[11px] text-text-muted font-medium">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end">
              <div>
                <span className="label-caps !text-[9px] block mb-1 opacity-60">{t('profit')}</span>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold",
                  transaction.totalProfit > 0 ? "text-emerald-500" : transaction.totalProfit < 0 ? "text-rose-500" : "text-text-muted"
                )}>
                  <TrendingUp className="w-3 h-3" />
                  {formatCurrency(transaction.totalProfit)}
                </div>
              </div>
              <div className="text-right">
                <span className="label-caps !text-[9px] block mb-1 opacity-60">{t('amount')}</span>
                <span className="text-lg font-bold font-mono text-text-heading tracking-tighter leading-none">{formatCurrency(transaction.totalAmount)}</span>
              </div>
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="py-12 text-center text-text-muted glass-panel border-surface-border">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-5 text-primary" />
            <p className="text-sm font-medium">{t('no_sales_recorded')}</p>
          </div>
        )}
      </div>

      <ReceiptModal 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </div>
  );
};
