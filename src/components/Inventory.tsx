/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Category } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { NumericInput } from './ui/NumericInput';

const categories: Category[] = ['Laptop', 'Computer', 'Accessories', 'CCTV', 'Service'];

interface CategoryTabProps {
  id: Category | 'All';
  label: string;
  active: boolean;
  onClick: () => void;
}

const CategoryTab: React.FC<CategoryTabProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-widest border",
      active 
        ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
        : "bg-surface-panel border-surface-border text-text-muted hover:border-primary/30 hover:text-text-heading"
    )}
  >
    {label}
  </button>
);

export const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, formatCurrency, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Accessories' as Category,
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    description: '',
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', category: 'Accessories', buyPrice: 0, sellPrice: 0, stock: 0, description: '' });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      stock: product.stock,
      description: product.description || '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="heading-display">{t('inventory')}</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Management Sistem Produk</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', category: 'Accessories', buyPrice: 0, sellPrice: 0, stock: 0, description: '' });
            setIsModalOpen(true);
          }} 
          className="btn-primary flex items-center gap-2 h-14 px-8 text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          {t('add_product')}
        </button>
      </div>

      {/* Category Navigation - "Halaman Terpisah" feel */}
      <div className="flex flex-wrap gap-3">
        <CategoryTab 
          id="All" 
          label={t('all_categories')} 
          active={selectedCategory === 'All'}
          onClick={() => setSelectedCategory('All')}
        />
        {categories.map(c => (
          <CategoryTab 
            key={c} 
            id={c} 
            label={t(`cat_${c}` as any)} 
            active={selectedCategory === c}
            onClick={() => setSelectedCategory(c)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Search Bar */}
        <div className="glass-panel p-4 border-white/5 group">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder={t('search_products')}
              className="input-field w-full !pl-14 h-14 bg-surface-base text-base font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Desktop Table View */}
      <div className="hidden md:block glass-panel overflow-hidden border-surface-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-base/50 border-b border-surface-border transition-colors">
                <th className="px-6 py-5 label-caps">{t('product')}</th>
                <th className="px-6 py-5 label-caps">{t('category')}</th>
                <th className="px-6 py-5 label-caps">{t('cost_price')}</th>
                <th className="px-6 py-5 label-caps">{t('sale_price')}</th>
                <th className="px-6 py-5 label-caps text-center">{t('stock')}</th>
                <th className="px-6 py-5 label-caps text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-surface-base/50 transition-colors border-b border-surface-border last:border-0 group">
                  <td className="px-6 py-6">
                    <div className="font-bold text-text-heading group-hover:text-primary transition-colors text-sm tracking-tight">{product.name}</div>
                    <div className="text-[11px] text-text-muted truncate w-64 mt-1 font-medium italic opacity-60 group-hover:opacity-100 transition-opacity">{product.description || t('no_description')}</div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-2.5 py-1 rounded-lg bg-surface-base border border-surface-border text-text-muted text-[10px] font-bold uppercase tracking-wider">
                      {t(`cat_${product.category}` as any)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-mono text-text-muted">{formatCurrency(product.buyPrice)}</td>
                  <td className="px-6 py-5 text-sm font-mono text-text-heading font-medium">
                    <div>{formatCurrency(product.sellPrice)}</div>
                    {product.sellPrice !== product.buyPrice && (
                      <div className={cn(
                        "text-xs font-bold mt-0.5",
                        product.sellPrice > product.buyPrice ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {product.sellPrice > product.buyPrice ? '+' : ''}{Math.round(((product.sellPrice - product.buyPrice) / (product.sellPrice || 1)) * 100)}% Margin
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "text-sm font-bold font-mono px-2 py-0.5 rounded flex items-center justify-center gap-1 mx-auto w-fit",
                      product.stock < 5 ? "text-[#FF0000] bg-[#FF0000]/10" : "text-emerald-500 bg-emerald-500/10"
                    )}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(product)} className="text-text-muted hover:text-text-heading hover:bg-surface-base p-2 rounded-lg transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="text-text-muted hover:text-rose-400 hover:bg-rose-400/10 p-2 rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center text-zinc-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p>{t('no_product_found')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="glass-panel p-5 border-surface-border space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-text-heading text-base leading-tight mb-1">{product.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-surface-base border border-surface-border text-text-muted text-[9px] font-bold uppercase tracking-wider transition-colors">
                    {t(`cat_${product.category}` as any)}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-colors",
                    product.stock < 5 ? "text-[#FF0000] bg-[#FF0000]/10" : "text-emerald-500 bg-emerald-500/10"
                  )}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(product)} className="text-text-muted hover:text-text-heading p-2 rounded-lg bg-surface-base transition-colors border border-surface-border">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProduct(product.id)} className="text-text-muted hover:text-rose-400 p-2 rounded-lg bg-surface-base transition-colors border border-surface-border">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {product.description && (
              <p className="text-xs text-slate-500 italic font-medium leading-relaxed">{product.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-border transition-colors">
              <div>
                <span className="label-caps !text-[9px] block mb-1 opacity-60">Buy Price</span>
                <span className="text-sm font-mono text-text-muted">{formatCurrency(product.buyPrice)}</span>
              </div>
              <div className="text-right">
                <span className="label-caps !text-[9px] block mb-1 opacity-60">Sell Price</span>
                <span className="text-sm font-bold font-mono text-text-heading tracking-tight">{formatCurrency(product.sellPrice)}</span>
                {product.sellPrice !== product.buyPrice && (
                  <div className={cn(
                    "text-[10px] font-bold mt-1",
                    product.sellPrice > product.buyPrice ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {product.sellPrice > product.buyPrice ? '+' : ''}{Math.round(((product.sellPrice - product.buyPrice) / (product.sellPrice || 1)) * 100)}% Margin
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-zinc-500 glass-panel border-white/5">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-10" />
            <p className="text-sm font-medium">{t('no_product_found')}</p>
          </div>
        )}
      </div>

        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-surface-panel border border-surface-border rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-text-heading">{editingId ? t('edit_product') : t('add_product')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-heading transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('product_name')}</label>
                  <input
                    required
                    type="text"
                    className="input-field w-full"
                    placeholder={t('example_product')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('category')}</label>
                    <select
                      className="input-field w-full"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    >
                      {categories.map(c => <option key={c} value={c}>{t(`cat_${c}` as any)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('initial_stock')}</label>
                    <NumericInput
                      required
                      className="input-field w-full"
                      value={formData.stock}
                      onChange={(val) => setFormData({ ...formData, stock: val })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('cost_price')}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                        <span className="text-xs font-bold mr-1">Rp</span>
                      </div>
                      <NumericInput
                        required
                        className="input-field w-full !pl-12"
                        placeholder="0"
                        value={formData.buyPrice}
                        onChange={(val) => setFormData({ ...formData, buyPrice: val })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('sale_price')}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                        <span className="text-xs font-bold mr-1">Rp</span>
                      </div>
                      <NumericInput
                        required
                        className="input-field w-full !pl-12"
                        placeholder="0"
                        value={formData.sellPrice}
                        onChange={(val) => setFormData({ ...formData, sellPrice: val })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('description_optional')}</label>
                  <textarea
                    className="input-field w-full h-24 resize-none"
                    placeholder={t('short_spec')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="order-2 sm:order-1 px-4 py-3 rounded-xl border border-surface-border text-slate-400 font-medium text-xs uppercase tracking-widest hover:text-white transition-colors flex-1"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="order-1 sm:order-2 btn-primary flex-1 py-3 font-bold text-xs uppercase tracking-widest"
                  >
                    {editingId ? t('save_changes') : t('add_to_catalog')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
