/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { cn } from './lib/utils';
import { Inventory } from './components/Inventory';
import { Sales } from './components/Sales';
import { History } from './components/History';
import { Customers } from './components/Customers';
import { Expenses } from './components/Expenses';
import { ThemeSettingsPanel } from './components/ThemeSettingsPanel';
import { 
  AlertCircle, 
  ChevronRight, 
  Trash2, 
  History as HistoryIcon, 
  Cpu, 
  Monitor, 
  Camera,
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';

const SettingsView = () => {
  const { t, language, setLanguage, isConnected, updateSupabaseConfig } = useApp();
  const [sbUrl, setSbUrl] = React.useState(localStorage.getItem('arv_tech_supabase_url') || '');
  const [sbKey, setSbKey] = React.useState(localStorage.getItem('arv_tech_supabase_key') || '');
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleSupabaseSave = async () => {
    setIsUpdating(true);
    const success = await updateSupabaseConfig(sbUrl, sbKey);
    setIsUpdating(false);
    if (success) {
      alert(t('supabase_updated'));
    } else {
      alert('Failed to connect. Please check your URL and Key.');
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl text-center max-w-3xl mx-auto shadow-2xl bg-surface-panel border-surface-border transition-colors">
      <div className="flex justify-center mb-6">
         <div className="p-4 bg-primary/10 rounded-full border border-primary/20 transition-colors">
            <Cpu className="w-12 h-12 text-primary" />
         </div>
      </div>
      <h3 className="heading-display text-3xl mb-2 transition-colors">ARV<span className="text-primary">-Tech</span> Finance</h3>
      <p className="label-caps tracking-[0.3em] font-bold text-text-muted transition-colors">{t('system_version')}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left mt-12">
         {/* Left Column: Data & Sync */}
         <div className="space-y-8">
            <div>
               <h4 className="label-caps px-2 mb-4 flex items-center gap-2 text-text-muted transition-colors">
                  <Database className="w-3.5 h-3.5 text-primary" />
                  {t('supabase_sync')}
               </h4>
               <div className="p-6 bg-surface-base rounded-3xl border border-surface-border space-y-5 transition-colors">
                  <div className="flex items-center justify-between p-4 bg-surface-panel rounded-2xl border border-surface-border transition-colors">
                     <div>
                        <p className="label-caps text-text-muted transition-colors">{t('supabase_status')}</p>
                        <p className={`text-sm font-bold flex items-center gap-2 mt-1 transition-colors ${isConnected ? 'text-emerald-500' : 'text-text-muted'}`}>
                           {isConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                           {isConnected ? t('supabase_connected') : t('supabase_disconnected')}
                        </p>
                     </div>
                     <Cloud className={`w-10 h-10 transition-colors ${isConnected ? 'text-emerald-500/10' : 'text-text-muted/20'}`} />
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="label-caps ml-2 mb-2 block">{t('supabase_url')}</label>
                        <input 
                           type="text" 
                           className="input-field w-full h-11" 
                           placeholder="https://xxx.supabase.co"
                           value={sbUrl}
                           onChange={(e) => setSbUrl(e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="label-caps ml-2 mb-2 block">{t('supabase_key')}</label>
                        <input 
                           type="password" 
                           className="input-field w-full h-11" 
                           placeholder="service_role or anon key"
                           value={sbKey}
                           onChange={(e) => setSbKey(e.target.value)}
                        />
                     </div>
                     <button 
                        onClick={handleSupabaseSave}
                        disabled={isUpdating}
                        className="w-full btn-primary py-3.5 text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2 shadow-primary/20 transition-all font-mono"
                     >
                        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {t('supabase_save')}
                     </button>
                  </div>
                  <p className="text-[10px] text-text-muted italic mt-4 leading-relaxed font-medium transition-colors">
                     {t('supabase_desc')}
                  </p>
               </div>
            </div>

            <div className={`${isConnected ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-surface-base border-surface-border'} p-6 rounded-3xl transition-all duration-500`}>
               <h4 className={`${isConnected ? 'text-emerald-500' : 'text-text-muted'} font-bold flex items-center gap-2 mb-3 text-sm tracking-tight transition-colors`}>
                  {isConnected ? <CheckCircle2 className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
                  {isConnected ? t('cloud_storage_active') : t('local_storage_warning')}
               </h4>
               <p className="text-xs leading-relaxed text-text-muted font-medium font-sans transition-colors">
                  {isConnected ? t('cloud_storage_desc') : t('local_storage_desc')}
               </p>
            </div>
         </div>

         {/* Right Column: Appearance & Info */}
         <div className="space-y-6">
            <div>
               <h4 className="label-caps px-2 mb-4 text-text-muted transition-colors">{t('language')}</h4>
               <div className="flex gap-2 p-1.5 bg-surface-base rounded-2xl border border-surface-border transition-colors">
                 <button 
                   onClick={() => setLanguage('id')}
                   className={cn(
                     "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                     language === 'id' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-text-muted hover:text-text-heading'
                   )}
                   style={{ backgroundColor: language === 'id' ? undefined : 'var(--nav-inactive-custom)' }}
                 >
                   {t('indonesian')}
                 </button>
                 <button 
                   onClick={() => setLanguage('en')}
                   className={cn(
                     "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                     language === 'en' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-text-muted hover:text-text-heading'
                   )}
                   style={{ backgroundColor: language === 'en' ? undefined : 'var(--nav-inactive-custom)' }}
                 >
                   {t('english')}
                 </button>
               </div>
            </div>

            <div>
               <h4 className="label-caps px-2 mb-4 text-text-muted transition-colors">{t('data_backup')}</h4>
               <div className="space-y-2">
                  <button 
                    onClick={() => {
                      const data = {
                        products: JSON.parse(localStorage.getItem('arv_tech_products') || '[]'),
                        transactions: JSON.parse(localStorage.getItem('arv_tech_transactions') || '[]')
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `arv-tech-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                    }}
                     className="btn-secondary w-full py-4 flex items-center justify-between group bg-surface-base border-surface-border hover:border-primary/30 transition-all"
                  >
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface-panel rounded-lg group-hover:text-primary transition-colors">
                           <HistoryIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <p className="font-bold text-sm tracking-tight text-text-heading transition-colors">{t('export_data')}</p>
                           <p className="text-[11px] text-text-muted font-medium italic group-hover:text-primary transition-all">{t('export_desc')}</p>
                        </div>
                     </div>
                     <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                  </button>
 
                  <button 
                    onClick={() => {
                      if(confirm(t('reset_confirm'))) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="btn-secondary w-full py-4 flex items-center justify-between group hover:border-rose-500/50 bg-surface-base border-surface-border transition-all"
                  >
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface-panel rounded-lg text-rose-500/80 group-hover:text-rose-500 transition-colors">
                           <Trash2 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <p className="font-bold text-sm text-rose-500/80 group-hover:text-rose-500 transition-colors tracking-tight">{t('reset_system')}</p>
                           <p className="text-[11px] text-text-muted font-medium italic group-hover:text-rose-500 transition-all">{t('reset_desc')}</p>
                        </div>
                     </div>
                     <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-rose-500 transition-colors" />
                  </button>
               </div>
            </div>
 
            <div>
               <h4 className="label-caps px-2 mb-4 text-text-muted transition-colors">{t('shop_info')}</h4>
               <div className="p-5 bg-surface-base rounded-2xl border border-surface-border space-y-4 transition-colors">
                  <div className="flex justify-between border-b border-surface-border pb-3 transition-colors">
                     <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest transition-colors">{t('brand_name')}</p>
                        <p className="text-sm text-text-heading font-bold transition-colors">ARV<span className="text-primary">-Tech</span></p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest transition-colors">{t('industry')}</p>
                        <p className="text-xs text-text-muted font-medium transition-colors">{t('hardware_info')}</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-all">
                        <Cpu className="w-5 h-5 text-white" />
                     </div>
                     <div className="w-10 h-10 rounded-xl bg-surface-panel flex items-center justify-center text-text-muted border border-surface-border transition-all hover:text-primary hover:border-primary/30">
                        <Monitor className="w-5 h-5" />
                     </div>
                     <div className="w-10 h-10 rounded-xl bg-surface-panel flex items-center justify-center text-text-muted border border-surface-border transition-all hover:text-primary hover:border-primary/30">
                        <Camera className="w-5 h-5" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export function MainApp() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'history':
        return <History />;
      case 'customers':
        return <Customers />;
      case 'expenses':
        return <Expenses />;
      case 'theme':
        return <ThemeSettingsPanel />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ThemeProvider>
  );
}
