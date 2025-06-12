import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard';
import InventoryLayout from './InventoryLayout';
import { mockAuth, mockProducts, mockCategories, mockSales, dashboardStats } from '../data/mock';

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
      default:
        return <Dashboard stats={dashboardStats} sales={mockSales} lowStock={mockProducts.filter(p => p.stock < 20)} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} 
      setCurrentView={setCurrentView} 
      user={user}
      isOpen={isSidebarOpen} 
      toggleSidebar={toggleSidebar}
      />
      <div className="flex-1 ml-64 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default POSBackOffice;