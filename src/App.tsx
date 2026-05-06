/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Sales } from './components/Sales';
import { History } from './components/History';
import { 
  AlertCircle, 
  ChevronRight, 
  Trash2, 
  History as HistoryIcon, 
  Cpu, 
  Monitor, 
  Camera 
} from 'lucide-react';

export default function App() {
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
      case 'settings':
        return (
          <div className="glass-panel p-8 rounded-3xl text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-2">ARV<span className="text-primary">-Tech</span> Finance System</h3>
            <p className="text-zinc-500 mb-8">Versi 1.0.0 (Local Build)</p>
            
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-8 text-left">
              <h4 className="text-amber-500 font-medium flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4" />
                Penyimpanan Lokal
              </h4>
              <p className="text-sm text-zinc-400">
                Data Anda disimpan secara aman di browser ini. Membersihkan cache browser atau "Clear Site Data" akan menghapus semua catatan keuangan Anda. Disarankan untuk melakukan backup secara berkala.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
               <div className="space-y-4">
                  <h4 className="font-medium text-white px-2">Data & Backup</h4>
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
                    className="btn-secondary w-full py-4 flex items-center justify-between group"
                  >
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-950 rounded-lg group-hover:text-primary transition-colors">
                           <HistoryIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <p className="font-medium text-sm">Ekspor Data</p>
                           <p className="text-[10px] text-zinc-500">Simpan cadangan ke file JSON</p>
                        </div>
                     </div>
                     <ChevronRight className="w-4 h-4 text-zinc-700" />
                  </button>

                  <button 
                    onClick={() => {
                      if(confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="btn-secondary w-full py-4 flex items-center justify-between group hover:border-rose-500/50"
                  >
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-950 rounded-lg text-rose-500">
                           <Trash2 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <p className="font-medium text-sm text-rose-500">Reset Sistem</p>
                           <p className="text-[10px] text-zinc-500">Hapus semua produk dan transaksi</p>
                        </div>
                     </div>
                     <ChevronRight className="w-4 h-4 text-zinc-700" />
                  </button>
               </div>

               <div className="space-y-4">
                  <h4 className="font-medium text-white px-2">Informasi Toko</h4>
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                     <div>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Nama Brand</p>
                        <p className="text-sm text-white font-bold">ARV<span className="text-primary">-Tech</span></p>
                     </div>
                     <div>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Bidang</p>
                        <p className="text-sm text-zinc-400 font-medium">Laptop | Computer | CCTV</p>
                     </div>
                     <div className="pt-2 border-t border-zinc-800/50 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                           <Cpu className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                           <Monitor className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                           <Camera className="w-4 h-4" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderView()}
      </Layout>
    </AppProvider>
  );
}
