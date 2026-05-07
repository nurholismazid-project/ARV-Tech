/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Settings,
  Cpu,
  Monitor,
  Camera,
  MousePointer2,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Users,
  CreditCard,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-text-muted hover:text-text-heading border border-transparent hover:border-surface-border"
    )}
    style={{ 
      backgroundColor: active ? undefined : 'var(--nav-inactive-custom)',
    }}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-text-muted group-hover:text-primary")} />
    <span className="font-medium">{label}</span>
    {active && (
      <motion.div
        layoutId="active-pill"
        className="absolute right-0 w-1 h-6 bg-white rounded-l-full"
      />
    )}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Layout = ({ children, currentView, onViewChange }: LayoutProps) => {
  const { t, language } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-surface-base">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-64 border-r border-surface-border flex-col gap-8 p-6 fixed h-full bg-surface-panel z-20">
        <div className="px-2 mb-2 text-center">
          <div>
            <h1 className="font-bold text-4xl tracking-tighter text-text-heading leading-none">
              ARV<span className="text-primary">-Tech</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.35em] text-text-muted font-medium mt-2">Finance Manager</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem 
            icon={LayoutDashboard} 
            label={t('dashboard')} 
            active={currentView === 'dashboard'} 
            onClick={() => onViewChange('dashboard')} 
          />
          <NavItem 
            icon={Package} 
            label={t('inventory')} 
            active={currentView === 'inventory'} 
            onClick={() => onViewChange('inventory')} 
          />
          <NavItem 
            icon={Users} 
            label={t('customers')} 
            active={currentView === 'customers'} 
            onClick={() => onViewChange('customers')} 
          />
          <NavItem 
            icon={ShoppingCart} 
            label={t('sales')} 
            active={currentView === 'sales'} 
            onClick={() => onViewChange('sales')} 
          />
          <NavItem 
            icon={History} 
            label={t('history')} 
            active={currentView === 'history'} 
            onClick={() => onViewChange('history')} 
          />
          <NavItem 
            icon={CreditCard} 
            label={t('expenses')} 
            active={currentView === 'expenses'} 
            onClick={() => onViewChange('expenses')} 
          />
          <NavItem 
            icon={Palette} 
            label={t('theme' as any) || 'Tampilan'} 
            active={currentView === 'theme'} 
            onClick={() => onViewChange('theme')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-surface-border">
           <NavItem 
            icon={Settings} 
            label={t('settings')} 
            active={currentView === 'settings'} 
            onClick={() => onViewChange('settings')} 
          />
        </div>
      </aside>

      {/* Bottom Nav - Mobile Only */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-surface-panel/80 backdrop-blur-xl border border-surface-border rounded-2xl flex items-center justify-around px-2 z-50 shadow-2xl">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'inventory', icon: Package },
          { id: 'customers', icon: Users },
          { id: 'sales', icon: ShoppingCart },
          { id: 'history', icon: History },
          { id: 'expenses', icon: CreditCard },
          { id: 'theme', icon: Palette },
          { id: 'settings', icon: Settings },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "p-3 rounded-xl transition-all duration-200",
              currentView === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:text-primary"
            )}
            style={{
              backgroundColor: currentView === item.id ? undefined : 'var(--nav-inactive-custom)',
            }}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen pb-32 lg:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-surface-border pb-6 gap-4">
            <div>
              <h2 className="text-2xl font-medium text-text-heading capitalize tracking-tight">
                {t(currentView as any)}
              </h2>
              <p className="text-text-muted text-xs uppercase tracking-widest mt-1">{t('overview')}</p>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
               <div className="text-left md:text-right">
                 <p className="text-sm font-bold text-text-heading font-mono tracking-wider">
                    {currentTime.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-GB', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit',
                      hour12: false
                    })}
                 </p>
                 <div className="flex items-center gap-2 justify-start md:justify-end mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{t('online')}</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-3">
                 <button 
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-xl bg-surface-panel border border-surface-border flex items-center justify-center text-text-muted hover:text-primary transition-colors shadow-sm"
                 >
                   {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
                 <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-primary/10">
                   ARV
                 </div>
               </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
