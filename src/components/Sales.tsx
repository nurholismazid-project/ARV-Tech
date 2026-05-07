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
  CreditCard,
  Percent,
  Banknote,
  MessageCircle,
  Image as ImageIcon,
  ChevronDown,
  Calendar,
  AlertCircle,
  Wallet,
  Building2,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReceiptModal } from './ReceiptModal';
import { CustomerSearchSelect } from './CustomerSearchSelect';
import { cn, formatRupiah, parseNumericValue } from '../lib/utils';

export const Sales = () => {
  const { products, customers, addTransaction, formatCurrency, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isShowingReceipt, setIsShowingReceipt] = useState(false);

  // New state for financial features
  const [discountType, setDiscountType] = useState<'percent' | 'nominal'>('percent');
  const [discountValue, setDiscountValue] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Transfer Bank' | 'E-Wallet'>('Tunai');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dueDate, setDueDate] = useState<number>(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
  
  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return (totalAmount * discountValue) / 100;
    }
    return discountValue;
  }, [totalAmount, discountType, discountValue]);

  const finalTotal = Math.max(0, totalAmount - discountAmount);
  const remainingBalance = Math.max(0, finalTotal - downPayment);
  
  const transactionStatus = useMemo((): 'Lunas' | 'Belum Lunas' | 'Draf' => {
    if (cart.length === 0) return 'Draf';
    if (remainingBalance <= 0) return 'Lunas';
    if (downPayment > 0) return 'Belum Lunas';
    return 'Belum Lunas';
  }, [cart.length, remainingBalance, downPayment]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulation or actual Supabase storage upload
    // For now, using a DataURL as simulation
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const getWhatsAppLink = () => {
    const customer = customers.find(c => c.name === customerName);
    if (!customer?.phone) return '#';

    const itemsText = cart.map(item => `${item.name} x${item.quantity}`).join('\n');
    const message = `Halo ${customerName},\n\nTerima kasih telah berbelanja di ARV TECH.\n\nDetail Transaksi:\n${itemsText}\n\nTotal Tagihan: ${formatRupiah(finalTotal)}\nSisa Tagihan: ${formatRupiah(remainingBalance)}\nStatus: ${transactionStatus}\n\nTerima kasih!`;
    
    return `https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  };
  
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
    
    const transactionData: Omit<Transaction, 'id' | 'date'> = {
      items,
      totalAmount: finalTotal,
      totalProfit,
      customerName: customerName || t('general_customer'),
      discountType,
      discountValue,
      discountAmount,
      downPayment,
      remainingBalance,
      paymentMethod,
      paymentProofUrl,
      status: transactionStatus,
      dueDate: remainingBalance > 0 ? dueDate : undefined
    };

    const txId = crypto.randomUUID();
    const date = Date.now();
    
    const fullTransaction: Transaction = {
      ...transactionData,
      id: txId,
      date
    };

    await addTransaction(transactionData as any);

    setLastTransaction({ ...transactionData, id: txId, date } as Transaction);
    setCart([]);
    setCustomerName('');
    setDiscountValue(0);
    setDownPayment(0);
    setPaymentProofUrl('');
    setShowSuccess(true);
    setIsShowingReceipt(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] lg:h-[calc(100vh-160px)] -mx-4 -mt-4 md:-mx-8 md:-mt-8 lg:-mx-10 lg:-mt-10 overflow-hidden bg-surface-base">
      {/* Product Selection (Left) */}
      <div className="flex-[1.4] md:flex-[0.6] lg:flex-[0.7] flex flex-col border-r border-surface-border bg-surface-base/50">
        {/* Sticky Search & Filter */}
        <div className="p-3 md:p-4 border-b border-surface-border bg-surface-panel/80 backdrop-blur-md sticky top-0 z-10 flex flex-col xl:flex-row gap-2 md:gap-3">
          <div className="relative flex-1 group">
            <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={t('search_products')}
              className="input-field w-full !pl-10 md:!pl-12 h-10 md:h-11 bg-surface-base text-sm font-medium tracking-tight transition-colors border-surface-border focus:border-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Optional Categories scroll/select */}
          <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
             {['All', 'Laptop', 'Computer', 'Accessories', 'Service'].map(cat => (
               <button 
                key={cat}
                className="px-3 md:px-4 h-9 md:h-11 rounded-lg md:rounded-xl bg-surface-panel border border-surface-border text-[10px] font-black uppercase tracking-widest text-text-muted hover:border-primary/30 hover:text-primary transition-all whitespace-nowrap active:scale-95 shrink-0"
               >
                 {cat === 'All' ? 'Semua' : cat}
               </button>
             ))}
          </div>
        </div>

        {/* Scrollable Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar bg-surface-base/20">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3">
            {filteredProducts.map(product => (
              <motion.button
                layout
                key={product.id}
                onClick={() => addToCart(product)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-surface-panel p-3 rounded-xl border border-surface-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all text-left flex flex-col gap-2"
              >
                <div className="flex justify-between items-start gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-text-muted/60 truncate">
                    {t(`cat_${product.category}` as any)}
                  </span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide shrink-0",
                    product.stock < 5 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  )}>
                    {product.stock}
                  </span>
                </div>
                
                <h4 className="text-xs md:text-sm font-bold text-text-heading group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[2.5em]">
                  {product.name}
                </h4>

                <div className="mt-auto flex items-end justify-between">
                  <p className="text-xs md:text-sm font-black font-mono text-text-heading tracking-tighter">
                    {formatRupiah(product.sellPrice)}
                  </p>
                  <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-text-muted bg-surface-panel/40 rounded-3xl border-2 border-dashed border-surface-border">
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">{t('no_product_available')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart & Checkout (Right) */}
      <div className="flex-1 md:flex-[0.4] lg:flex-[0.3] flex flex-col bg-surface-panel shadow-2xl relative z-20 border-t md:border-t-0 md:border-l border-surface-border pb-24 md:pb-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-black text-text-heading uppercase tracking-widest">{t('cart')} ({cart.length})</h3>
          </div>
          <button 
            onClick={() => setCart([])}
            className="text-text-muted hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>

        {/* Customer Select */}
        <div className="p-4 bg-surface-base/30 border-b border-surface-border">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">{t('customer_name')}</label>
          <CustomerSearchSelect 
            value={customerName} 
            onChange={setCustomerName} 
          />
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          <AnimatePresence mode="popLayout">
            {cart.map(item => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.productId} 
                className="group bg-surface-base/50 p-3 rounded-xl border border-surface-border/50 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h4 className="text-xs font-bold text-text-heading line-clamp-1">{item.name}</h4>
                    <p className="text-[11px] text-text-muted font-mono mt-0.5">{formatRupiah(item.price)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-1 pt-2 border-t border-surface-border/30">
                  <div className="flex items-center bg-surface-panel rounded-lg border border-surface-border overflow-hidden size-sm">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 px-2 hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black font-mono text-text-heading">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 px-2 hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-black text-text-heading font-mono">{formatRupiah(item.price * item.quantity)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-text-muted py-10">
              <ShoppingCart className="w-10 h-10 opacity-10 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('no_item_added')}</p>
            </div>
          )}
        </div>

        {/* Fixed Bottom Summary */}
        <div className="p-5 bg-surface-panel border-t border-surface-border space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          {/* Sub-inputs: Discount, DP, Method */}
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5 text-left">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Diskon</label>
                  <div className="flex gap-2">
                    <button onClick={() => setDiscountType('percent')} className={cn("text-[9px] font-black", discountType === 'percent' ? "text-primary" : "text-text-muted opacity-40")}>%</button>
                    <button onClick={() => setDiscountType('nominal')} className={cn("text-[9px] font-black", discountType === 'nominal' ? "text-primary" : "text-text-muted opacity-40")}>Rp</button>
                  </div>
                </div>
                <input
                  type="text"
                  className="w-full bg-surface-base border border-surface-border rounded-lg h-10 px-3 text-xs font-mono font-bold focus:border-primary/50 text-right"
                  value={discountType === 'percent' ? discountValue || '' : (discountValue ? formatRupiah(discountValue) : '')}
                  onChange={(e) => setDiscountValue(parseNumericValue(e.target.value))}
                />
             </div>
             <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Uang Muka (DP)</label>
                <input
                  type="text"
                  className="w-full bg-surface-base border border-surface-border rounded-lg h-10 px-3 text-xs font-mono font-bold focus:border-primary/50 text-right"
                  value={downPayment ? formatRupiah(downPayment) : ''}
                  onChange={(e) => setDownPayment(parseNumericValue(e.target.value))}
                />
             </div>
          </div>

          <div className="space-y-1.5 text-left">
             <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Payment Method</label>
             <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-surface-base border border-surface-border rounded-lg h-10 px-3 text-xs font-black uppercase tracking-widest focus:border-primary/50"
             >
                <option value="Tunai">Tunai</option>
                <option value="Transfer Bank">Transfer</option>
                <option value="E-Wallet">E-Wallet</option>
             </select>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-[10px] font-black text-text-muted uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="font-mono">{formatRupiah(totalAmount)}</span>
            </div>
            {(discountAmount > 0 || downPayment > 0) && (
              <div className="space-y-1">
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <span>Discount</span>
                    <span className="font-mono">-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                {downPayment > 0 && (
                  <div className="flex justify-between items-center text-[10px] font-black text-primary/70 uppercase tracking-widest">
                    <span>DP Paid</span>
                    <span className="font-mono">-{formatRupiah(downPayment)}</span>
                  </div>
                )}
              </div>
            )}
            <div className="pt-3 flex justify-between items-end border-t border-surface-border/50">
               <div className="text-left">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">
                    {remainingBalance > 0 ? "Sisa Tagihan" : "Total Bayar"}
                  </p>
                  <p className={cn(
                    "text-xl font-black font-mono tracking-tighter leading-none",
                    remainingBalance > 0 ? "text-primary" : "text-text-heading"
                  )}>
                    {formatRupiah(remainingBalance > 0 ? remainingBalance : finalTotal)}
                  </p>
               </div>
               <div className={cn(
                 "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.1em]",
                 remainingBalance > 0 ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
               )}>
                 {remainingBalance > 0 ? "Piutang" : "Lunas"}
               </div>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full h-14 bg-primary text-white rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale group"
          >
            <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">{t('complete_transaction')}</span>
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-text-heading text-white px-8 py-4 rounded-2xl flex items-center gap-4 z-[100] shadow-2xl border border-white/10"
          >
            <div className="p-2 bg-primary rounded-full">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
               <p className="text-xs font-black uppercase tracking-widest">{t('transaction_success')}</p>
               <p className="text-white/60 text-[9px] font-bold mt-0.5">{t('inventory_updated')}</p>
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
