/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, TransactionItem, Transaction } from '../types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2,
  User,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReceiptModal } from './ReceiptModal';
import { cn } from '../lib/utils';

export const Sales = () => {
  const { products, addTransaction, formatCurrency, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isShowingReceipt, setIsShowingReceipt] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.stock > 0 && p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.sellPrice }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        const newQty = item.quantity + delta;
        if (newQty < 1 || (product && newQty > product.stock)) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    let totalProfit = 0;
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        totalProfit += (item.price - product.buyPrice) * item.quantity;
      }
    });

    const items = cart.map(item => ({ ...item, totalPrice: item.price * item.quantity }));
    
    const transactionData = {
      items,
      totalAmount,
      totalProfit,
      customerName: customerName || t('general_customer'),
    };

    const txId = crypto.randomUUID();
    const date = Date.now();
    
    const fullTransaction: Transaction = {
      ...transactionData,
      id: txId,
      date
    };

    await addTransaction(transactionData);

    setLastTransaction(fullTransaction);
    setCart([]);
    setCustomerName('');
    setShowSuccess(true);
    setIsShowingReceipt(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-white/5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={t('search_products')}
              className="input-field w-full !pl-12 py-3.5 text-sm font-medium tracking-tight"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="glass-panel p-5 rounded-2xl flex justify-between items-center hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="space-y-1">
                <p className="label-caps !text-slate-500">{t(`cat_${product.category}` as any)}</p>
                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-tight">{product.name}</h4>
                <p className="text-lg font-bold font-mono text-white pt-1">{formatCurrency(product.sellPrice)}</p>
              </div>
              <div className="text-right">
                <span className="label-caps block mb-1.5">{t('stock')}</span>
                <span className={cn(
                   "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                   product.stock < 5 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-primary/10 text-primary border border-primary/20'
                )}>
                  {product.stock} {t('unit')}
                </span>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <div className="inline-flex p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-500 glass-panel rounded-2xl border-dashed">
               <p>{t('no_product_available')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart / Summary */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-3xl sticky top-8 border-primary/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{t('cart')}</h3>
          </div>

          <div className="space-y-3 mb-8">
            <label className="label-caps ml-1">{t('customer_name')}</label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
               <input
                type="text"
                placeholder={t('general_customer')}
                className="input-field w-full !pl-12 text-sm font-medium"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-8 border-y border-zinc-800/50 py-4">
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center group">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white truncate w-40">{item.name}</h4>
                  <p className="text-xs text-zinc-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-zinc-900 transition-colors text-zinc-500"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-mono text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-zinc-900 transition-colors text-zinc-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-zinc-600 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="text-center py-10 text-zinc-600">
                <p className="text-sm">{t('no_item_added')}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm text-zinc-400">
               <span>{t('subtotal')}</span>
               <span className="font-mono">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
               <span>{t('tax')} (0%)</span>
               <span className="font-mono">Rp 0</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-white pt-3 border-t border-zinc-800">
              <span>{t('total')}</span>
              <span className="text-primary font-mono">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            <CreditCard className="w-6 h-6" />
            {t('complete_transaction')}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel border-primary/50 bg-primary/10 px-8 py-4 rounded-2xl flex items-center gap-4 z-50 pointer-events-none"
          >
            <div className="p-2 bg-primary rounded-full">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
               <p className="text-white font-medium">{t('transaction_success')}</p>
               <p className="text-primary/80 text-sm">{t('inventory_updated')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReceiptModal 
        transaction={isShowingReceipt ? lastTransaction : null} 
        onClose={() => setIsShowingReceipt(false)} 
      />
    </div>
  );
};
