/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, User, X, Check, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { AddCustomerModal } from './AddCustomerModal';

interface CustomerSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomerSearchSelect: React.FC<CustomerSearchSelectProps> = ({ value, onChange }) => {
  const { customers, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.phone && c.phone.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.name === value);
  }, [customers, value]);

  const handleSelect = (name: string) => {
    onChange(name);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddNew = () => {
    setIsAddModalOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "input-field w-full h-12 flex items-center justify-between cursor-pointer px-4 gap-3 bg-surface-base transition-all",
            isOpen && "border-primary/50 shadow-lg shadow-primary/5"
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <User className={cn("w-4 h-4 shrink-0 transition-colors", value ? "text-primary" : "text-text-muted")} />
            <span className={cn(
              "text-sm font-medium truncate",
              !value && "text-text-muted opacity-60"
            )}>
              {value || t('general_customer')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {value && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="p-1 hover:bg-rose-500/10 text-text-muted hover:text-rose-500 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className={cn(
              "w-4 h-4 border-l-2 border-b-2 border-text-muted/40 transition-transform duration-300 ml-1 mt-[-2px]",
              isOpen ? "rotate-[135deg]" : "-rotate-45"
            )} />
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 left-0 right-0 mt-2 bg-surface-panel border border-surface-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              <div className="p-3 border-b border-surface-border/50 sticky top-0 bg-surface-panel/80">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Cari pelanggan..."
                    className="w-full bg-surface-base border border-surface-border rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:border-primary/50 outline-none transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-primary/20">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelect(customer.name)}
                      className={cn(
                        "w-full px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-all group",
                        value === customer.name && "bg-primary/5"
                      )}
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={cn(
                          "text-sm font-bold transition-colors",
                          value === customer.name ? "text-primary" : "text-text-heading group-hover:text-primary"
                        )}>
                          {customer.name}
                        </span>
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                            <Phone className="w-2.5 h-2.5" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                      {value === customer.name && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-text-muted">
                    <p className="text-xs italic">Pelanggan tidak ditemukan</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddNew}
                className="w-full p-4 flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary border-t border-surface-border/50 transition-all font-bold text-xs uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" />
                Tambah Pelanggan Baru
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(customer) => {
          onChange(customer.name);
          setIsAddModalOpen(false);
        }}
      />
    </>
  );
};
