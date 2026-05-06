/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, TransactionItem } from '../types';
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

export const Sales = () => {
  const { products, addTransaction, formatCurrency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
  
  const handleCheckout = () => {
    if (cart.length === 0) return;

    let totalProfit = 0;
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        totalProfit += (item.price - product.buyPrice) * item.quantity;
      }
    });

    addTransaction({
      items: cart,
      totalAmount,
      totalProfit,
      customerName,
    });

    setCart([]);
    setCustomerName('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/10 p-4 rounded-xl border border-surface-border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
              className="input-field w-full pl-12 py-3 text-sm"
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
              className="glass-panel p-4 rounded-2xl flex justify-between items-center hover:border-primary/50 transition-all text-left group"
            >
              <div>
                <h4 className="font-medium text-white group-hover:text-primary transition-colors">{product.name}</h4>
                <p className="text-xs text-zinc-500 uppercase font-medium tracking-wider">{product.category}</p>
                <p className="text-lg font-mono text-zinc-100 mt-1">{formatCurrency(product.sellPrice)}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-medium block mb-1">Stok Tersedia</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${product.stock < 5 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {product.stock} Unit
                </span>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1.5 bg-primary rounded-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-500 glass-panel rounded-2xl border-dashed">
               <p>Tidak ada produk yang tersedia</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart / Summary */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-3xl sticky top-8">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-medium text-white">Keranjang Belanja</h3>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest block">Nama Pelanggan</label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
               <input
                type="text"
                placeholder="Pelanggan Umum"
                className="input-field w-full pl-10 text-sm"
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
                <p className="text-sm">Belum ada item ditambahkan</p>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-zinc-400">
               <span>Subtotal</span>
               <span className="font-mono">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
               <span>Pajak (0%)</span>
               <span className="font-mono">Rp 0</span>
            </div>
            <div className="flex justify-between text-2xl font-medium text-white pt-3 border-t border-zinc-800">
              <span>Total</span>
              <span className="text-primary font-mono">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            <CreditCard className="w-6 h-6" />
            Selesaikan Transaksi
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel border-emerald-500/50 bg-emerald-500/10 px-8 py-4 rounded-2xl flex items-center gap-4 z-50 pointer-events-none"
          >
            <div className="p-2 bg-emerald-500 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
               <p className="text-white font-medium">Transaksi Berhasil!</p>
               <p className="text-emerald-500/80 text-sm">Inventaris telah diperbarui secara otomatis.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
