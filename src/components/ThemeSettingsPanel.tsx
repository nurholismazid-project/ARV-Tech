import React from 'react';
import { Settings, RefreshCw, Type, Palette, Sun, Moon, Check } from 'lucide-react';
import { useTheme, ThemeSettings } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';

export const ThemeSettingsPanel: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    settings, 
    lightSettings, 
    darkSettings, 
    updateLightSettings, 
    updateDarkSettings, 
    resetSettings 
  } = useTheme();
  const { t } = useApp();
  const [configMode, setConfigMode] = React.useState<'light' | 'dark'>(theme);

  const currentEditingSettings = configMode === 'light' ? lightSettings : darkSettings;

  const handleSettingChange = (key: keyof ThemeSettings, value: any) => {
    if (configMode === 'light') updateLightSettings({ [key]: value });
    else updateDarkSettings({ [key]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Configuration Mode Switcher */}
      <div className="flex gap-2 p-1.5 bg-surface-panel border border-surface-border rounded-2xl w-fit">
        <button
          onClick={() => setConfigMode('light')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
            configMode === 'light' 
              ? "bg-primary text-white shadow-lg shadow-primary/20" 
              : "text-text-muted hover:text-text-heading"
          )}
        >
          <Sun className="w-4 h-4" />
          {t('light_mode' as any) || 'Mode Terang'}
        </button>
        <button
          onClick={() => setConfigMode('dark')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
            configMode === 'dark' 
              ? "bg-primary text-white shadow-lg shadow-primary/20" 
              : "text-text-muted hover:text-text-heading"
          )}
        >
          <Moon className="w-4 h-4" />
          {t('dark_mode' as any) || 'Mode Gelap'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Settings Controls */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border-surface-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-text-heading">
                  {t('theme_colors' as any) || 'Warna Tema'} 
                  <span className="text-text-muted text-xs font-normal ml-2">
                    ({configMode === 'light' ? 'Editing Light' : 'Editing Dark'})
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => resetSettings(configMode)}
                className="p-2 text-text-muted hover:text-primary transition-colors bg-surface-base rounded-lg"
                title="Reset to Default"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dark/Light Mode (Active App Theme) */}
              <div className="flex items-center justify-between p-3 bg-surface-base rounded-xl border border-surface-border">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-text-main">{t('theme_mode' as any) || 'Mode Tema Aktif'}</span>
                  <p className="text-[10px] text-text-muted">Ganti tampilan aplikasi saat ini</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-panel border border-surface-border rounded-lg text-text-heading hover:bg-primary/5 hover:border-primary/30 transition-all font-bold text-xs uppercase"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>

              {/* Theme Color */}
              <div className="space-y-2">
                <label className="label-caps block ml-1">{t('primary_color' as any) || 'Warna Utama'}</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={currentEditingSettings.themeColor}
                    onChange={(e) => handleSettingChange('themeColor', e.target.value)}
                    className="w-12 h-12 rounded-xl bg-surface-base border border-surface-border p-1 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={currentEditingSettings.themeColor}
                    onChange={(e) => handleSettingChange('themeColor', e.target.value)}
                    className="input-field flex-1 h-12 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Button Text Color */}
              <div className="space-y-2">
                <label className="label-caps block ml-1">{t('button_text_color' as any) || 'Warna Teks Tombol'}</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={currentEditingSettings.buttonTextColor}
                    onChange={(e) => handleSettingChange('buttonTextColor', e.target.value)}
                    className="w-12 h-12 rounded-xl bg-surface-base border border-surface-border p-1 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={currentEditingSettings.buttonTextColor}
                    onChange={(e) => handleSettingChange('buttonTextColor', e.target.value)}
                    className="input-field flex-1 h-12 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Text Color Override */}
              <div className="space-y-2">
                <label className="label-caps block ml-1">{t('text_color' as any) || 'Warna Teks Global'}</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={currentEditingSettings.textColor}
                    onChange={(e) => handleSettingChange('textColor', e.target.value)}
                    className="w-12 h-12 rounded-xl bg-surface-base border border-surface-border p-1 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={currentEditingSettings.textColor}
                    onChange={(e) => handleSettingChange('textColor', e.target.value)}
                    className="input-field flex-1 h-12 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Inactive Button Color */}
              <div className="space-y-2">
                <label className="label-caps block ml-1">{t('inactive_button_color' as any) || 'Warna Tombol Sidebar Inaktif'}</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={currentEditingSettings.inactiveButtonColor === 'transparent' ? '#000000' : currentEditingSettings.inactiveButtonColor}
                    onChange={(e) => handleSettingChange('inactiveButtonColor', e.target.value)}
                    className="w-12 h-12 rounded-xl bg-surface-base border border-surface-border p-1 cursor-pointer"
                  />
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text" 
                      value={currentEditingSettings.inactiveButtonColor}
                      onChange={(e) => handleSettingChange('inactiveButtonColor', e.target.value)}
                      className="input-field flex-1 h-12 uppercase font-mono"
                    />
                    <button 
                      onClick={() => handleSettingChange('inactiveButtonColor', 'transparent')}
                      className="px-3 bg-surface-base border border-surface-border rounded-xl text-[10px] font-bold uppercase hover:text-primary transition-colors"
                      title="Set to transparent"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Selection Color */}
              <div className="space-y-2">
                <label className="label-caps block ml-1">{t('selection_color' as any) || 'Warna Seleksi Teks'}</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={currentEditingSettings.selectionColor.substring(0, 7)}
                    onChange={(e) => handleSettingChange('selectionColor', e.target.value + '33')}
                    className="w-12 h-12 rounded-xl bg-surface-base border border-surface-border p-1 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={currentEditingSettings.selectionColor}
                    onChange={(e) => handleSettingChange('selectionColor', e.target.value)}
                    className="input-field flex-1 h-12 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Chart Tooltip Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label-caps block ml-1">Chart Tooltip BG</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={currentEditingSettings.chartTooltipBg}
                      onChange={(e) => handleSettingChange('chartTooltipBg', e.target.value)}
                      className="w-10 h-10 rounded-lg bg-surface-base border border-surface-border p-1 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={currentEditingSettings.chartTooltipBg}
                      onChange={(e) => handleSettingChange('chartTooltipBg', e.target.value)}
                      className="input-field flex-1 h-10 uppercase font-mono text-[10px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-caps block ml-1">Chart Tooltip Text</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={currentEditingSettings.chartTooltipText}
                      onChange={(e) => handleSettingChange('chartTooltipText', e.target.value)}
                      className="w-10 h-10 rounded-lg bg-surface-base border border-surface-border p-1 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={currentEditingSettings.chartTooltipText}
                      onChange={(e) => handleSettingChange('chartTooltipText', e.target.value)}
                      className="input-field flex-1 h-10 uppercase font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border-surface-border">
            <div className="flex items-center gap-2 mb-6">
              <Type className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-text-heading">{t('typography' as any) || 'Tipografi'}</h3>
            </div>

            <div className="space-y-6">
              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="label-caps">{t('font_size' as any) || 'Ukuran Teks (Global)'}</label>
                  <span className="text-sm font-bold text-primary font-mono">{currentEditingSettings.fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="20" 
                  step="1"
                  value={currentEditingSettings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-base rounded-lg appearance-none cursor-pointer accent-primary border border-surface-border"
                />
              </div>

              {/* Font Weight */}
              <div className="space-y-2">
                <label className="label-caps block ml-1">{t('font_weight' as any) || 'Ketebalan Teks (Global)'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleSettingChange('fontWeight', '400')}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest",
                      currentEditingSettings.fontWeight === '400' 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-surface-base border-surface-border text-text-muted hover:border-primary/30"
                    )}
                  >
                    {currentEditingSettings.fontWeight === '400' && <Check className="w-3 h-3" />}
                    Regular (400)
                  </button>
                  <button 
                    onClick={() => handleSettingChange('fontWeight', '700')}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest",
                      currentEditingSettings.fontWeight === '700' 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-surface-base border-surface-border text-text-muted hover:border-primary/30"
                    )}
                  >
                    {currentEditingSettings.fontWeight === '700' && <Check className="w-3 h-3" />}
                    Bold (700)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="space-y-6">
          <div className="sticky top-8">
            <h3 className="label-caps mb-4 ml-1">Live Preview ({configMode === 'light' ? 'Mode Terang' : 'Mode Gelap'})</h3>
            <div 
              className={cn(
                "p-8 rounded-[2rem] border space-y-6 shadow-2xl overflow-hidden relative group transition-all duration-500",
                configMode === 'light' 
                  ? "bg-white border-slate-200 text-slate-900" 
                  : "bg-zinc-950 border-zinc-800 text-white"
              )}
              style={configMode === theme ? undefined : {
                // Approximate preview if not in current theme
                backgroundColor: configMode === 'light' ? '#ffffff' : '#09090b',
                color: currentEditingSettings.textColor,
                fontSize: `${currentEditingSettings.fontSize}px`,
                fontWeight: currentEditingSettings.fontWeight,
              }}
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl group-hover:opacity-20 transition-opacity" 
                style={{ backgroundColor: currentEditingSettings.themeColor, opacity: 0.1 }}
              />
              
              <div className="space-y-2 relative">
                <h4 className="text-4xl font-bold tracking-tight">
                  ARV<span style={{ color: currentEditingSettings.themeColor }}>-Tech</span>
                </h4>
                <p 
                  className="font-bold tracking-[0.3em] text-[10px] uppercase"
                  style={{ color: configMode === 'light' ? '#64748b' : '#94a3b8' }}
                >
                  Design System Preview
                </p>
              </div>

              <div className="space-y-4 relative">
                <h5 className="text-xl font-bold tracking-tight">Eksplorasi Kreativitas Tanpa Batas</h5>
                <p className="leading-relaxed opacity-80">
                  Ini adalah contoh tampilan teks dengan pengaturan yang Anda pilih untuk **{configMode === 'light' ? 'Mode Terang' : 'Mode Gelap'}**. 
                  Anda dapat menyesuaikan warna primer, warna teks, hingga ketebalan font 
                  untuk menciptakan pengalaman pengguna yang unik dan personal.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 relative pt-4">
                <button 
                  className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
                  style={{ 
                    backgroundColor: currentEditingSettings.themeColor,
                    color: currentEditingSettings.buttonTextColor,
                    boxShadow: `0 10px 15px -3px ${currentEditingSettings.themeColor}33`
                  }}
                >
                  Active Button
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  className="px-6 py-2.5 rounded-xl border font-bold text-sm transition-all"
                  style={{ 
                    backgroundColor: currentEditingSettings.inactiveButtonColor === 'transparent' ? (configMode === 'light' ? '#f1f5f9' : '#18181b') : currentEditingSettings.inactiveButtonColor,
                    borderColor: configMode === 'light' ? '#e2e8f0' : '#27272a',
                    color: configMode === 'light' ? '#64748b' : '#94a3b8'
                  }}
                >
                  Inactive Button
                </button>
              </div>

              <div 
                className="p-4 rounded-2xl border mt-8 space-y-2"
                style={{ 
                  backgroundColor: configMode === 'light' ? '#f8fafc' : '#111113',
                  borderColor: configMode === 'light' ? '#e2e8f0' : '#27272a'
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase opacity-50">Selection Preview</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-sm font-medium">
                  Coba <span 
                    className="p-1 px-2 rounded-lg border"
                    style={{ 
                      backgroundColor: currentEditingSettings.selectionColor,
                      color: currentEditingSettings.themeColor,
                      borderColor: `${currentEditingSettings.themeColor}33`
                    }}
                  >pilih teks ini</span> untuk melihat warna seleksi kustom Anda.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-text-heading">Sinkronisasi Pintar</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  Aplikasi akan secara otomatis beralih menggunakan pengaturan 
                  **{configMode === 'light' ? 'Terang' : 'Gelap'}** saat Anda mengganti mode tampilan sistem atau aplikasi.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
