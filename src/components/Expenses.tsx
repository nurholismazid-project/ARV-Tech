/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseCategory } from '../types';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  Tag,
  DollarSign,
  X,
  CreditCard,
  FileText,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const CATEGORY_OPTIONS: ExpenseCategory[] = [
  'Operational',
  'Marketing',
  'Salary',
  'Rent',
  'Utilities',
  'Equipment',
  'Other'
];

export const Expenses = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, formatCurrency, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    category: 'Operational' as ExpenseCategory,
    description: '',
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const descMatch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const catMatch = t(`cat_${e.category}` as any).toLowerCase().includes(searchTerm.toLowerCase());
      return descMatch || catMatch;
    });
  }, [expenses, searchTerm, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateExpense(editingId, formData);
    } else {
      await addExpense(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ amount: 0, category: 'Operational', description: '' });
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
    });
    setEditingId(expense.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-display">{t('expenses')}</h2>
          <div className="flex items-center gap-3 mt-1">
             <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 uppercase tracking-widest">
               <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
               {formatCurrency(totalExpense)} {t('total_expenses')}
             </div>
          </div>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ amount: 0, category: 'Operational', description: '' });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 h-12 px-6"
        >
          <Plus className="w-4 h-4" />
          {t('add_expense')}
        </button>
      </div>

      <div className="glass-panel p-4 mb-6 border-white/5">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={t('search_expenses')}
            className="input-field w-full !pl-14 h-12 bg-slate-900/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Expenses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredExpenses.map((expense) => (
            <motion.div
              key={expense.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel group relative flex flex-col p-6 hover:border-primary/30 transition-all border-white/5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-inner group-hover:border-primary/20 transition-all">
                  <CreditCard className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(expense)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(expense.id)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                   <h4 className="font-bold text-white text-lg group-hover:text-primary transition-colors leading-tight truncate">
                      {expense.description}
                   </h4>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         {t(`cat_${expense.category}` as any)}
                      </span>
                   </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/[0.03]">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    {format(expense.date, 'dd MMM yyyy, HH:mm')}
                  </div>
                  <div className="flex items-center gap-3 text-lg font-mono font-bold text-rose-500">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredExpenses.length === 0 && (
        <div className="py-20 text-center text-slate-600 bg-slate-950/30 rounded-3xl border border-dashed border-white/5">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-5 text-primary" />
          <p className="text-sm font-medium">{t('no_expense_found')}</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative glass-panel w-full max-w-lg p-8 border-white/10"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{editingId ? t('edit_expense') : t('add_expense')}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">{t('expense_details' as any)}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="label-caps ml-2">{t('expense_amount')}</label>
                    <div className="relative group">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                          <span className="text-sm font-bold mr-1 text-slate-500">Rp</span>
                          <DollarSign className="w-4 h-4 text-slate-600" />
                       </div>
                       <input
                         type="number"
                         required
                         className="input-field w-full !pl-20 h-14 font-mono text-lg font-bold tracking-tight bg-slate-900/50"
                         placeholder="0"
                         value={formData.amount || ''}
                         onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label-caps ml-2">{t('expense_category')}</label>
                    <div className="relative group">
                      <select
                        className="input-field w-full h-14 appearance-none cursor-pointer pr-12 !pl-14 bg-slate-900/50"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                      >
                        {CATEGORY_OPTIONS.map(opt => (
                          <option key={opt} value={opt} className="bg-slate-900">{t(`cat_${opt}` as any)}</option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label-caps ml-2">{t('expense_description')}</label>
                    <textarea
                      required
                      className="input-field w-full p-4 h-32 resize-none"
                      placeholder={t('expense_description')}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-14 rounded-2xl border border-white/5 font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest text-xs"
                  >
                    {t('cancel' as any)}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                  >
                    {editingId ? t('save_changes' as any) : t('add_expense')}
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
