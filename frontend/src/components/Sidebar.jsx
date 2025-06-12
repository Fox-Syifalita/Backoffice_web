import React from 'react';
import LogoutButton from '../components/LogoutButton';

import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Truck, 
  icons,
  Package2,
  TruckIcon
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'products', label: 'Inventory and Products', icon: Package },
  { id: 'purchase', label: 'Purchase', icon: TruckIcon},
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'supplier', label: 'Supplier', icon: Truck },
  { id: 'reports', label: 'Reports', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const Sidebar = ({ currentView, setCurrentView, user, isOpen, toggleSidebar }) => {
  return (
    <div 
      className={`bg-gray-900 text-white h-screen fixed top-0 left-0 overflow-y-auto transition-all duration-300
        ${isOpen ? 'w-64' : 'w-0'}`
      }
    >
    <div className={`${isOpen ? 'block' : 'hidden'} p-4 border-b border-gray-700`}>
    <h1 className="text-xl font-bold">Back Office</h1>
    <p className="text-sm text-gray-400">{user?.name}</p>
    </div>
      <nav className={`${isOpen ? 'block' : 'hidden'} mt-4`}>
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={toggleSidebar}
            className="text-white p-2 bg-gray-800 hover:bg-gray-700 rounded"
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        ))}
      
        <div className="mt-8 px-4">
          <LogoutButton onLogout={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }} />
        </div>  
      </nav>
    </div>
  );
};

export default Sidebar;
