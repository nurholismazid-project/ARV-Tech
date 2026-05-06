/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Transaction, Category, Customer } from '../types';
import { translations, Language, TranslationKey } from '../translations';
import { supabase as initialSupabase, getSupabaseClient } from '../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

interface AppContextType {
  products: Product[];
  transactions: Transaction[];
  customers: Customer[];
  language: Language;
  isLoading: boolean;
  isConnected: boolean;
  setLanguage: (lang: Language) => void;
  updateSupabaseConfig: (url: string, key: string) => Promise<boolean>;
  t: (key: TranslationKey) => string;
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [language, setLanguageState] = useState<Language>('id');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient>(initialSupabase);

  // Load from Supabase with localStorage fallback
  const initializeData = useCallback(async (client: SupabaseClient = supabaseClient) => {
    setIsLoading(true);
    try {
      // Test connection
      const { error: healthError } = await client.from('products').select('id').limit(1);
      
      // If healthError is missing relation, it means connected but no tables
      const isActuallyConnected = !healthError || healthError.code === 'PGRST116' || healthError.message.includes('relation "products" does not exist');
      setIsConnected(isActuallyConnected);

      // 1. Fetch Products
      const { data: productsData, error: productsError } = await client
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;
      if (productsData && productsData.length > 0) {
        setProducts(productsData);
      } else {
        const savedProducts = localStorage.getItem('arv_tech_products');
        if (savedProducts) setProducts(JSON.parse(savedProducts));
      }

      // 2. Fetch Transactions
      const { data: transactionsData, error: transactionsError } = await client
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      if (transactionsData && transactionsData.length > 0) {
        setTransactions(transactionsData);
      } else {
        const savedTransactions = localStorage.getItem('arv_tech_transactions');
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      }

      // 3. Fetch Customers
      const { data: customersData, error: customersError } = await client
        .from('customers')
        .select('*');
      
      if (customersError) {
        // If not connected to real supabse or table missing, fallback
        const savedCustomers = localStorage.getItem('arv_tech_customers');
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      } else if (customersData && customersData.length > 0) {
        setCustomers(customersData);
      } else {
        const savedCustomers = localStorage.getItem('arv_tech_customers');
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      }

    } catch (error) {
      console.error('Database error:', error);
      setIsConnected(false);
      const savedProducts = localStorage.getItem('arv_tech_products');
      const savedTransactions = localStorage.getItem('arv_tech_transactions');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    } finally {
      const savedLanguage = localStorage.getItem('arv_tech_language') as Language;
      if (savedLanguage && (savedLanguage === 'id' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
      setIsLoading(false);
    }
  }, [supabaseClient]);

  const updateSupabaseConfig = async (url: string, key: string) => {
    try {
      // Use getSupabaseClient(url, key) which has persistSession: false
      const newClient = getSupabaseClient(url, key);
      const { error } = await newClient.from('products').select('id').limit(1);
      
      const isOkay = !error || error.code === 'PGRST116' || error.message.includes('relation "products" does not exist');
      
      if (isOkay) {
        localStorage.setItem('arv_tech_supabase_url', url);
        localStorage.setItem('arv_tech_supabase_key', key);
        setIsConnected(true);
        
        // After saving, we should ideally reload to re-initialize the singleton with new config
        // or we can manually create a new persistent client and set it
        // but to avoid the multiple instance warning, we'd need to destroy the old one if possible.
        // For now, reload is cleanest for a configuration change.
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return true;
      }
      return false;
    } catch (e) {
      setIsConnected(false);
      return false;
    }
  };

  useEffect(() => {
    initializeData(initialSupabase);
  }, [initializeData]);

  // Sync back to local as backup
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('arv_tech_products', JSON.stringify(products));
      localStorage.setItem('arv_tech_transactions', JSON.stringify(transactions));
      localStorage.setItem('arv_tech_customers', JSON.stringify(customers));
    }
  }, [products, transactions, customers, isLoading]);

  useEffect(() => {
    localStorage.setItem('arv_tech_language', language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

  const addProduct = async (productData: Omit<Product, 'id' | 'updatedAt'>) => {
    const newProduct = {
      ...productData,
      id: crypto.randomUUID(),
      updatedAt: Date.now(),
    };
    
    try {
      const { data, error } = await supabaseClient.from('products').insert([newProduct]).select();
      if (error) throw error;
      if (data) setProducts((prev) => [...prev, data[0]]);
    } catch (error) {
      console.error('Error adding product:', error);
      setProducts((prev) => [...prev, newProduct]);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const updates = { ...productData, updatedAt: Date.now() };
    try {
      const { error } = await supabaseClient.from('products').update(updates).eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    } catch (error) {
      console.error('Error updating product:', error);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabaseClient.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'updatedAt'>) => {
    const newCustomer = {
      ...customerData,
      id: crypto.randomUUID(),
      updatedAt: Date.now(),
    };
    
    try {
      const { data, error } = await supabaseClient.from('customers').insert([newCustomer]).select();
      if (error) throw error;
      if (data) setCustomers((prev) => [...prev, data[0]]);
    } catch (error) {
      console.error('Error adding customer:', error);
      setCustomers((prev) => [...prev, newCustomer]);
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    const updates = { ...customerData, updatedAt: Date.now() };
    try {
      const { error } = await supabaseClient.from('customers').update(updates).eq('id', id);
      if (error) throw error;
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    } catch (error) {
      console.error('Error updating customer:', error);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabaseClient.from('customers').delete().eq('id', id);
      if (error) throw error;
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      date: Date.now(),
    };

    try {
      const { data, error } = await supabaseClient.from('transactions').insert([newTransaction]).select();
      if (error) throw error;
      
      if (data) {
        setTransactions((prev) => [data[0], ...prev]);
        for (const item of transactionData.items) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            await updateProduct(product.id, { stock: product.stock - item.quantity });
          }
        }
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      setTransactions((prev) => [newTransaction, ...prev]);
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          const soldItem = transactionData.items.find((item) => item.productId === product.id);
          if (soldItem) {
            return {
              ...product,
              stock: product.stock - soldItem.quantity,
              updatedAt: Date.now(),
            };
          }
          return product;
        })
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        transactions,
        customers,
        language,
        isLoading,
        isConnected,
        setLanguage,
        updateSupabaseConfig,
        t,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addTransaction,
        formatCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
