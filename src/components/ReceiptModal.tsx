/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal = ({ transaction, onClose }: ReceiptModalProps) => {
  const { formatCurrency, t } = useApp();

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none"
        >
          <div className="p-6 overflow-y-auto max-h-[90vh] print:max-h-none print:p-0">
            {/* Action Buttons (Hidden on Print) */}
            <div className="flex justify-between items-center mb-6 print:hidden">
               <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
               >
                  <X className="w-5 h-5" />
               </button>
               <button 
                  onClick={handlePrint}
                  className="btn-primary py-2 px-4 rounded-xl flex items-center gap-2 text-xs"
               >
                  <Printer className="w-4 h-4" />
                  {t('print')}
               </button>
            </div>

            {/* Receipt Content */}
            <div id="receipt-content" className="text-zinc-900 font-mono text-xs print:text-sm">
               <div className="text-center space-y-1 mb-6 border-b border-dashed border-zinc-300 pb-6">
                  <h2 className="text-base font-bold tracking-tighter uppercase">ARV-Tech Finance</h2>
                  <p className="text-[10px] print:text-xs text-zinc-500">Jl. Teknologi No. 42, Digital City</p>
                  <p className="text-[10px] print:text-xs text-zinc-500">Tel: +62 812 3456 7890</p>
               </div>

               <div className="space-y-1 mb-6">
                  <div className="flex justify-between">
                     <span className="text-zinc-500">{t('order_id')}:</span>
                     <span className="font-bold">#{transaction.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-zinc-500">{t('date_time')}:</span>
                     <span>{format(transaction.date, 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-zinc-500">{t('customer')}:</span>
                     <span className="truncate max-w-[120px]">{transaction.customerName || t('walk_in_customer')}</span>
                  </div>
               </div>

               <div className="border-y border-dashed border-zinc-300 py-4 mb-4">
                  <div className="grid grid-cols-6 gap-2 mb-2 font-bold text-zinc-500 uppercase text-[10px]">
                     <div className="col-span-3">{t('products_label')}</div>
                     <div className="text-center">Qty</div>
                     <div className="col-span-2 text-right">{t('amount')}</div>
                  </div>
                  <div className="space-y-2">
                     {transaction.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-6 gap-2">
                           <div className="col-span-3 leading-tight">{item.name}</div>
                           <div className="text-center">{item.quantity}</div>
                           <div className="col-span-2 text-right font-bold">{formatCurrency(item.totalPrice)}</div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-2 mb-8">
                  <div className="flex justify-between">
                     <span className="text-zinc-500">{t('subtotal')}</span>
                     <span>{formatCurrency(transaction.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-zinc-500">{t('tax')} (0%)</span>
                     <span>Rp 0</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-zinc-200">
                     <span>{t('total')}</span>
                     <span>{formatCurrency(transaction.totalAmount)}</span>
                  </div>
               </div>

               <div className="text-center space-y-2 pt-4 border-t border-dashed border-zinc-300">
                  <div className="flex justify-center mb-2">
                     <CheckCircle2 className="w-6 h-6 text-primary opacity-30" />
                  </div>
                  <p className="uppercase font-bold tracking-widest text-[10px]">{t('transaction_success')}</p>
                  <p className="text-[9px] text-zinc-400">Terima kasih telah berbelanja di ARV-Tech!</p>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Hide everything else when printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 100%;
            max-width: 300px;
          }
          @page {
            size: auto;
            margin: 0;
          }
        }
      `}} />
    </AnimatePresence>
  );
};
