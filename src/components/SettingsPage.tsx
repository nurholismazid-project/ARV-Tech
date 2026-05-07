import React from 'react';
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
  RefreshCw,
  Globe,
  Store,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeSettingsSection } from './ThemeSettings';
import { cn } from '../lib/utils';

export const SettingsPage = () => {
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
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      <div className="text-center space-y-2 mb-10">
        <h2 className="heading-display text-4xl">{t('settings')}</h2>
        <p className="text-text-muted font-medium uppercase tracking-[0.2em] text-[10px]">Pusat Kontrol & Konfigurasi Sistem</p>
      </div>

      {/* Section 1: Sinkronisasi Data */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-text-heading text-lg leading-none">Sinkronisasi Data</h3>
            <p className="text-xs text-text-muted mt-1">Konfigurasi database cloud Supabase</p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl bg-surface-panel border-surface-border transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="p-6 bg-surface-base rounded-2xl border border-surface-border space-y-5 transition-colors">
                <div className="flex items-center justify-between p-4 bg-surface-panel rounded-xl border border-surface-border transition-colors">
                  <div>
                    <p className="label-caps text-[10px] text-text-muted transition-colors">{t('supabase_status')}</p>
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

            <div className="space-y-6">
              <div className={`${isConnected ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-surface-base border-surface-border'} p-6 rounded-2xl transition-all duration-500`}>
                <h4 className={`${isConnected ? 'text-emerald-500' : 'text-text-muted'} font-bold flex items-center gap-2 mb-3 text-sm tracking-tight transition-colors`}>
                  {isConnected ? <CheckCircle2 className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
                  {isConnected ? t('cloud_storage_active') : t('local_storage_warning')}
                </h4>
                <p className="text-xs leading-relaxed text-text-muted font-medium font-sans transition-colors">
                  {isConnected ? t('cloud_storage_desc') : t('local_storage_desc')}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="label-caps px-2 text-text-muted transition-colors flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  {t('language')}
                </h4>
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
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Tampilan & Tema */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-text-heading text-lg leading-none">Tampilan & Tema</h3>
            <p className="text-xs text-text-muted mt-1">Kustomisasi warna, tipografi, dan mode visual</p>
          </div>
        </div>
        
        <ThemeSettingsSection />
      </div>

      {/* Section 3: Informasi Toko & Backup */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-text-heading text-lg leading-none">Informasi Toko & Sistem</h3>
            <p className="text-xs text-text-muted mt-1">Identitas bisnis dan manajemen backup data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 bg-surface-panel border-surface-border transition-colors space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="label-caps !text-xs text-text-heading">{t('shop_info')}</h4>
            </div>
            
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
                <div className="w-10 h-10 rounded-xl bg-surface-panel border border-surface-border flex items-center justify-center text-text-muted transition-all">
                  <Monitor className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-surface-panel border border-surface-border flex items-center justify-center text-text-muted transition-all">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{t('system_version')}</p>
                <p className="text-xs text-text-heading font-medium mt-1">v2.4.0 Stable Core</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 bg-surface-panel border-surface-border transition-colors space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <HistoryIcon className="w-4 h-4 text-primary" />
              <h4 className="label-caps !text-xs text-text-heading">{t('data_backup')}</h4>
            </div>
            
            <div className="space-y-3">
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
        </div>
      </div>
    </div>
  );
};
