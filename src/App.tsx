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
import { SettingsPage } from './components/SettingsPage';
import { 
  RefreshCw 
} from 'lucide-react';

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
      case 'settings':
        return <SettingsPage />;
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
