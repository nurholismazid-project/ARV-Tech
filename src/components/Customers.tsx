/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User,
  Phone,
  Tag,
  MapPin,
  X,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { CustomerReference } from '../types';

const REFERENCE_OPTIONS: CustomerReference[] = [
  'Offline',
  'Reseller',
  'WhatsApp',
  'Facebook',
  'Instagram',
  'TikTok',
  'Website'
];

export const Customers = () => {
  const { customers, transactions, addCustomer, updateCustomer, deleteCustomer, formatCurrency, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    reference: 'Offline' as CustomerReference,
    address: '',
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = c.phone?.includes(searchTerm);
      const refMatch = c.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || phoneMatch || refMatch;
    });
  }, [customers, searchTerm]);

  const customerStats = useMemo(() => {
    const stats: Record<string, { totalSpent: number; lastDate: number | null }> = {};
    
    transactions.forEach(tx => {
      if (!tx.customerName) return;
      
      const customer = customers.find(c => c.name === tx.customerName);
      if (customer) {
        if (!stats[customer.id]) {
          stats[customer.id] = { totalSpent: 0, lastDate: null };
        }
        stats[customer.id].totalSpent += tx.totalAmount;
        if (!stats[customer.id].lastDate || tx.date > stats[customer.id].lastDate!) {
          stats[customer.id].lastDate = tx.date;
        }
      }
    });
    
    return stats;
  }, [transactions, customers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCustomer(editingId, formData);
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', reference: 'Offline', address: '' });
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      reference: customer.reference || 'Offline',
      address: customer.address || '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-surface-panel/40 p-4 rounded-xl border border-surface-border space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 transition-colors">
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={t('search_customers')}
            className="input-field w-full !pl-14 h-12 bg-surface-base transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }} 
          className="btn-primary flex items-center gap-2 whitespace-nowrap justify-center h-11 px-6 text-xs font-bold uppercase tracking-widest shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('add_customer')}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const stats = customerStats[customer.id] || { totalSpent: 0, lastDate: null };
          return (
            <motion.div 
              layout
              key={customer.id} 
              className="glass-panel p-6 border-surface-border group hover:border-primary/20 transition-all flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-base border border-surface-border flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-heading tracking-tight text-lg">{customer.name}</h4>
                    <span className="label-caps !text-[9px] !text-text-muted">ID: {customer.id.slice(0, 8)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(customer)} className="text-text-muted hover:text-text-heading hover:bg-surface-base p-2 rounded-lg transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm(t('delete_customer_confirm'))) {
                        deleteCustomer(customer.id);
                      }
                    }} 
                    className="text-text-muted hover:text-rose-400 hover:bg-rose-400/10 p-2 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {(customer.phone || customer.reference || customer.address) ? (
                  <div className="space-y-3">
                    {customer.phone && (
                      <div className="flex items-center gap-3 text-xs text-text-muted font-medium">
                        <Phone className="w-3.5 h-3.5 text-text-muted/60" />
                        {customer.phone}
                      </div>
                    )}
                    {customer.reference && (
                      <div className="flex items-center gap-3 text-xs text-text-muted font-medium">
                        <Tag className="w-3.5 h-3.5 text-text-muted/60" />
                        {customer.reference}
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-start gap-3 text-xs text-text-muted font-medium leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-text-muted/60 mt-0.5 shrink-0" />
                        {customer.address}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center border-y border-surface-border/50 border-dashed transition-colors">
                    <p className="text-[10px] text-text-muted font-medium italic opacity-60">No contact info provided</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-surface-border/50 grid grid-cols-2 gap-4 transition-colors">
                <div>
                  <p className="label-caps !text-[9px] mb-1">{t('total_spent')}</p>
                  <p className="text-sm font-bold text-primary font-mono tracking-tight">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <div>
                  <p className="label-caps !text-[9px] mb-1">{t('last_transaction')}</p>
                  <p className="text-sm font-bold text-text-heading font-mono tracking-tight">
                    {stats.lastDate ? format(stats.lastDate, 'dd MMM yy') : '-'}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-20 text-center text-zinc-500 glass-panel border-white/5">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="font-medium">{t('no_customer_found')}</p>
          </div>
        )}
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
              className="relative bg-surface-panel border border-surface-border rounded-3xl w-full max-w-lg p-8 shadow-2xl transition-colors"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text-heading tracking-tight">{editingId ? t('edit_customer') : t('add_customer')}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-heading transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps ml-2">{t('customer_name')}</label>
                  <input
                    required
                    type="text"
                    className="input-field w-full h-12"
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label-caps ml-2">{t('phone_number')}</label>
                    <input
                      type="tel"
                      className="input-field w-full h-12"
                      placeholder="0812..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-caps ml-2">{t('customer_category')}</label>
                    <div className="relative group">
                      <select
                        className="input-field w-full h-12 appearance-none cursor-pointer !pl-4 pr-10 bg-surface-base"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value as CustomerReference })}
                      >
                        {REFERENCE_OPTIONS.map(opt => (
                          <option key={opt} value={opt} className="bg-surface-panel">{opt}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                        <Tag className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-caps ml-2">{t('address')}</label>
                  <textarea
                    className="input-field w-full h-24 resize-none py-3"
                    placeholder="Alamat lengkap..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="order-2 sm:order-1 px-6 py-3.5 rounded-2xl border border-white/5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex-1"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="order-1 sm:order-2 btn-primary flex-1 py-3.5 font-bold text-xs uppercase tracking-widest shadow-primary/20"
                  >
                    {editingId ? t('save_changes') : t('add_customer')}
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
