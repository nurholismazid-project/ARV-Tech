/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, CustomerReference } from '../types';
import { User, Phone, Tag, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customer: Customer) => void;
}

const REFERENCE_OPTIONS: CustomerReference[] = [
  'Offline',
  'Reseller',
  'WhatsApp',
  'Facebook',
  'Instagram',
  'TikTok',
  'Website'
];

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { addCustomer, t } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    reference: 'Offline' as CustomerReference,
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // In AppContext, addCustomer returns void but updates state.
      // We want to pass the new customer object back to the caller.
      // For this simple case, we'll construct it manually or rely on state sync.
      // A better way is to make addCustomer return the new object.
      
      const newCustomerData = {
        name: formData.name,
        phone: formData.phone,
        reference: formData.reference,
        address: formData.address,
      };

      await addCustomer(newCustomerData);
      
      // Since AppContext's addCustomer updates the state asynchronously,
      // we'll pass the data we just sent. The caller will find it in the sync.
      if (onSuccess) {
        onSuccess({
          ...newCustomerData,
          id: '', // Will be updated by state sync
          updatedAt: Date.now()
        } as Customer);
      }
      
      // Reset form
      setFormData({ name: '', phone: '', reference: 'Offline', address: '' });
      onClose();
    } catch (error) {
      console.error('Failed to add customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-surface-panel border border-surface-border rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl transition-colors"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-heading tracking-tight">Tambah Pelanggan Baru</h3>
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-text-heading transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="label-caps ml-2">{t('customer_name')}</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    autoFocus
                    type="text"
                    className="input-field w-full h-12 !pl-12"
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="label-caps ml-2">{t('phone_number')}</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                      type="tel"
                      className="input-field w-full h-12 !pl-12"
                      placeholder="0812..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-caps ml-2">Kategori</label>
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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                      <Tag className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-caps ml-2">{t('address')}</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <textarea
                    className="input-field w-full h-24 resize-none !pl-12 py-3"
                    placeholder="Alamat lengkap (opsional)..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="order-2 sm:order-1 px-6 py-3.5 rounded-2xl border border-surface-border text-text-muted font-bold text-[10px] uppercase tracking-widest hover:text-text-heading hover:bg-surface-base transition-all flex-1"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="order-1 sm:order-2 btn-primary flex-1 py-3.5 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
