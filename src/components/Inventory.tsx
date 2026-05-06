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
  const { products, addProduct, updateProduct, deleteProduct, formatCurrency } = useApp();
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
      <div className="bg-slate-800/10 p-4 rounded-xl border border-surface-border space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products..."
            className="input-field w-full pl-12 py-2.5 text-xs h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <select
              className="input-field pl-9 appearance-none pr-8 w-full text-xs h-10"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
            }} 
            className="btn-primary flex items-center gap-2 whitespace-nowrap justify-center h-10 px-5 text-[10px] font-bold uppercase tracking-widest shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-800/20 border-b border-surface-border">
                <th className="px-6 py-4 text-slate-500 font-medium text-[10px] uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-slate-500 font-medium text-[10px] uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-slate-500 font-medium text-[10px] uppercase tracking-widest">Cost Price</th>
                <th className="px-6 py-4 text-slate-500 font-medium text-[10px] uppercase tracking-widest">Sale Price</th>
                <th className="px-6 py-4 text-slate-500 font-medium text-[10px] uppercase tracking-widest text-center">Stock</th>
                <th className="px-6 py-4 text-slate-500 font-medium text-[10px] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-800/5 transition-colors border-b border-white/[0.02] last:border-0 group">
                <td className="px-6 py-5">
                  <div className="font-medium text-white group-hover:text-primary transition-colors">{product.name}</div>
                  <div className="text-[10px] text-slate-500 truncate w-48 mt-0.5">{product.description || 'No description available'}</div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-400 text-[10px] font-medium uppercase border border-slate-700/50">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-5 text-xs font-mono text-slate-500">{formatCurrency(product.buyPrice)}</td>
                <td className="px-6 py-5 text-sm font-mono text-white font-medium">{formatCurrency(product.sellPrice)}</td>
                <td className="px-6 py-5 text-center">
                  <span className={cn(
                    "text-xs font-bold font-mono px-2 py-0.5 rounded flex items-center justify-center gap-1 mx-auto w-fit",
                    product.stock < 5 ? "text-rose-400 bg-rose-400/10" : "text-emerald-400 bg-emerald-400/10"
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
                  <p>Tidak ada produk ditemukan</p>
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
                <h3 className="text-xl font-medium text-white">{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Nama Produk</label>
                  <input
                    required
                    type="text"
                    className="input-field w-full"
                    placeholder="Contoh: Laptop ASUS ROG Zephyrus"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Kategori</label>
                    <select
                      className="input-field w-full"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Stok Awal</label>
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
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Harga Beli</label>
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
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Harga Jual</label>
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
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Keterangan (Opsional)</label>
                  <textarea
                    className="input-field w-full h-24 resize-none"
                    placeholder="Spesifikasi singkat..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="order-2 sm:order-1 px-4 py-3 rounded-xl border border-surface-border text-slate-400 font-medium text-[10px] uppercase tracking-widest hover:text-white transition-colors flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="order-1 sm:order-2 btn-primary flex-1 py-3 font-bold text-[10px] uppercase tracking-widest"
                  >
                    {editingId ? 'Save Changes' : 'Add to Catalog'}
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
