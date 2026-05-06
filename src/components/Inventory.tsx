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
  Filter,
  Package,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const categories: Category[] = ['Laptop', 'Computer', 'Accessories', 'CCTV', 'Service'];

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
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t('search_products')}
            className="input-field w-full !pl-12 py-3 text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <select
              className="input-field !pl-10 appearance-none pr-8 w-full text-sm font-medium h-11"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
            >
              <option value="All">{t('all_categories')}</option>
              {categories.map(c => <option key={c} value={c}>{t(`cat_${c}` as any)}</option>)}
            </select>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
            }} 
            className="btn-primary flex items-center gap-2 whitespace-nowrap justify-center h-10 px-5 text-xs font-bold uppercase tracking-widest shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('add_product')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-white/5">
                <th className="px-6 py-5 label-caps">{t('product')}</th>
                <th className="px-6 py-5 label-caps">{t('category')}</th>
                <th className="px-6 py-5 label-caps">{t('cost_price')}</th>
                <th className="px-6 py-5 label-caps">{t('sale_price')}</th>
                <th className="px-6 py-5 label-caps text-center">{t('stock')}</th>
                <th className="px-6 py-5 label-caps text-right">{t('actions')}</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-800/5 transition-colors border-b border-white/[0.02] last:border-0 group">
                <td className="px-6 py-6">
                  <div className="font-bold text-white group-hover:text-primary transition-colors text-sm tracking-tight">{product.name}</div>
                  <div className="text-[11px] text-slate-500 truncate w-64 mt-1 font-medium italic opacity-60 group-hover:opacity-100 transition-opacity">{product.description || t('no_description')}</div>
                </td>
                <td className="px-6 py-6">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    {t(`cat_${product.category}` as any)}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm font-mono text-slate-500">{formatCurrency(product.buyPrice)}</td>
                <td className="px-6 py-5 text-sm font-mono text-white font-medium">
                  <div>{formatCurrency(product.sellPrice)}</div>
                  {product.sellPrice > product.buyPrice && (
                    <div className="text-xs text-primary font-bold mt-0.5">
                      +{Math.round(((product.sellPrice - product.buyPrice) / product.sellPrice) * 100)}% Margin
                    </div>
                  )}
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={cn(
                    "text-sm font-bold font-mono px-2 py-0.5 rounded flex items-center justify-center gap-1 mx-auto w-fit",
                    product.stock < 5 ? "text-rose-400 bg-rose-400/10" : "text-primary bg-primary/10"
                  )}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => handleEdit(product)} className="text-slate-500 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 p-2 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-zinc-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p>{t('no_product_found')}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                <h3 className="text-xl font-medium text-white">{editingId ? t('edit_product') : t('add_product')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
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
                    <input
                      required
                      type="number"
                      className="input-field w-full"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('cost_price')}</label>
                    <input
                      required
                      type="number"
                      className="input-field w-full"
                      placeholder="Rp"
                      value={formData.buyPrice}
                      onChange={(e) => setFormData({ ...formData, buyPrice: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('sale_price')}</label>
                    <input
                      required
                      type="number"
                      className="input-field w-full"
                      placeholder="Rp"
                      value={formData.sellPrice}
                      onChange={(e) => setFormData({ ...formData, sellPrice: parseInt(e.target.value) || 0 })}
                    />
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
