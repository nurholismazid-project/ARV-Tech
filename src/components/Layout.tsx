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
  Users,
  CreditCard,
  Sun,
  Moon,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

interface NavItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick, collapsed }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-visible",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-text-muted hover:text-text-heading border border-transparent hover:border-surface-border",
        collapsed && "justify-center px-0"
      )}
      style={{ 
        backgroundColor: active ? undefined : 'var(--nav-inactive-custom)',
      }}
    >
      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-white" : "text-text-muted group-hover:text-primary")} />
      
      {!collapsed && (
        <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
          {label}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {collapsed && isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 15 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute left-full z-[100] ml-2 px-3 py-1.5 bg-text-heading text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
          >
            {label}
            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-text-heading" />
          </motion.div>
        )}
      </AnimatePresence>

      {active && !collapsed && (
        <motion.div
          layoutId="active-pill"
          className="absolute right-0 w-1 h-6 bg-white rounded-l-full"
        />
      )}
      
      {active && collapsed && (
        <motion.div
          layoutId="active-dot-collapsed"
          className="absolute right-1 w-1.5 h-1.5 bg-white rounded-full shadow-sm"
        />
      )}
    </button>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Layout = ({ children, currentView, onViewChange }: LayoutProps) => {
  const { t, language } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Sidebar states
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('arv_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle auto-collapse on tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        const saved = localStorage.getItem('arv_sidebar_collapsed');
        if (saved !== null) setIsCollapsed(JSON.parse(saved));
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('arv_sidebar_collapsed', JSON.stringify(isCollapsed));
    // Update CSS Variable for dynamic spacing
    const width = isCollapsed ? '80px' : '256px';
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, [isCollapsed]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'inventory', icon: Package, label: t('inventory') },
    { id: 'customers', icon: Users, label: t('customers') },
    { id: 'sales', icon: ShoppingCart, label: t('sales') },
    { id: 'history', icon: History, label: t('history') },
    { id: 'expenses', icon: CreditCard, label: t('expenses') },
  ];

  return (
    <div className="flex min-h-screen bg-surface-base transition-colors duration-300">
      {/* Sidebar - Desktop/Tablet */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-surface-border fixed h-full bg-surface-panel z-[40] transition-all duration-500 ease-in-out shadow-2xl shadow-black/5",
          isCollapsed ? "w-20 p-4" : "w-64 p-6"
        )}
      >
        <div className={cn("px-2 mb-8 flex items-center justify-between", isCollapsed && "flex-col gap-4 px-0")}>
          <div className={cn("transition-all duration-500", isCollapsed ? "opacity-0 scale-50 h-0" : "opacity-100 scale-100 mb-2")}>
            <h1 className="font-bold text-3xl tracking-tighter text-text-heading leading-none">
              ARV<span className="text-primary">-Tech</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-black mt-1.5 opacity-60">Finance Manager</p>
          </div>
          
          {/* Logo Replacement for Collapsed State */}
          <div className={cn(
            "w-10 h-10 bg-primary/10 rounded-xl items-center justify-center transition-all duration-500",
            !isCollapsed ? "hidden" : "flex"
          )}>
            <span className="text-primary font-black text-xs">ARV</span>
          </div>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-xl border border-surface-border bg-surface-base text-text-muted hover:text-primary transition-all hover:shadow-lg",
              isCollapsed && "mt-2"
            )}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={currentView === item.id} 
              onClick={() => onViewChange(item.id)} 
              collapsed={isCollapsed}
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-surface-border space-y-2">
           <NavItem 
            icon={Settings} 
            label={t('settings')} 
            active={currentView === 'settings'} 
            onClick={() => onViewChange('settings')} 
            collapsed={isCollapsed}
          />
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-surface-panel z-[100] p-6 shadow-2xl flex flex-col gap-8 md:hidden"
            >
              <div className="flex items-center justify-between">
                <div>
                   <h1 className="font-bold text-3xl tracking-tighter text-text-heading leading-none">
                    ARV<span className="text-primary">-Tech</span>
                  </h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl bg-surface-base border border-surface-border text-text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavItem 
                    key={item.id}
                    icon={item.icon} 
                    label={item.label} 
                    active={currentView === item.id} 
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileMenuOpen(false);
                    }} 
                  />
                ))}
              </nav>

              <div className="mt-auto pb-4">
                 <NavItem 
                  icon={Settings} 
                  label={t('settings')} 
                  active={currentView === 'settings'} 
                  onClick={() => {
                    onViewChange('settings');
                    setIsMobileMenuOpen(false);
                  }} 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 min-h-screen pb-32 md:pb-0 transition-all duration-500 ease-in-out",
          "md:ml-[var(--sidebar-width)]"
        )}
      >
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
          <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-surface-border pb-8 gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2.5 rounded-xl bg-surface-panel border border-surface-border text-text-muted hover:text-primary md:hidden shadow-sm"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-text-heading capitalize tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  {t(currentView as any)}
                </h2>
                <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1 ml-4 opacity-70">Control Panel / {currentView}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
               <div className="text-left sm:text-right hidden xs:block">
                 <p className="text-sm font-black text-text-heading font-mono tracking-wider tabular-nums">
                    {currentTime.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-GB', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit',
                      hour12: false
                    })}
                 </p>
                 <div className="flex items-center gap-2 justify-start sm:justify-end mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40 animate-pulse" />
                   <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">{t('online')}</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                 <button 
                  onClick={toggleTheme}
                  className="w-11 h-11 rounded-2xl bg-surface-panel border border-surface-border flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm hover:shadow-md hover:border-primary/20"
                 >
                   {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
                 <div className="flex items-center gap-3 pl-4 border-l border-surface-border">
                    <div className="text-right hidden sm:block text-text-heading">
                      <p className="text-xs font-black leading-none">Admin</p>
                      <p className="text-[9px] text-text-muted uppercase tracking-tight font-bold mt-1">Arv Tech</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-[10px] font-black text-white shadow-xl shadow-primary/20 ring-2 ring-surface-base">
                      ARV
                    </div>
                 </div>
               </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-surface-panel/90 backdrop-blur-xl border border-surface-border rounded-2xl flex items-center justify-around px-2 z-50 shadow-2xl">
        {navItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "p-3 rounded-xl transition-all duration-200",
              currentView === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:text-primary"
            )}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
        <button
          onClick={() => onViewChange('settings')}
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            currentView === 'settings' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:text-primary"
          )}
        >
          <Settings className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
};
