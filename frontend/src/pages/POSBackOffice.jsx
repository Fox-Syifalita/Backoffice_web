import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard';
import InventoryLayout from './InventoryLayout';
import Purchases from './Purchase';
import Sales from './Sales';
import Supplier from './Supplier';
import Reports from './Reports';
import { mockAuth, mockProducts, mockCategories, mockSales, dashboardStats } from '../data/mock';
import Employees from './Employee';
import Settings from './Setting';

const POSBackOffice = ({user, onLogout}) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            stats={dashboardStats}
            sales={mockSales}
            lowStock={mockProducts.filter(p => p.stock < 20)}
          />
        );
      case 'products':
      case 'stockMovement':
      case 'stockOpname':
      case 'barcode':
        return <InventoryLayout selectedTab={currentView} />;
      case 'purchases' :
        return <Purchases />;
      case 'sales' :
        return <Sales />;
      case 'supplier' :
        return <Supplier />;
      case 'reports' :
        return <Reports />;
      case 'employee' :
        return <Employees />;
      case 'settings' :
        return <Settings />;
      default:
        return <Dashboard stats={dashboardStats} sales={mockSales} lowStock={mockProducts.filter(p => p.stock < 20)} />;
    }
  };

  return (
    <div className={`flex`}>
      <Sidebar 
      currentView={currentView} 
      setCurrentView={setCurrentView} 
      user={user}
      isSidebarOpen={isSidebarOpen} 
      toggleSidebar={toggleSidebar}
      />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-4`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default POSBackOffice;