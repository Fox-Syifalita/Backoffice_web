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
  Package2
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory dan Produk', icon: Package},
  { id: 'products', label: 'Products', icon: Package },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'supplier', label: 'Supplier', icon: Truck },
  { id: 'reports', label: 'Reports', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const Sidebar = ({ currentView, setCurrentView, user }) => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Back Office</h1>
        <p className="text-sm text-gray-400">{user?.name}</p>
      </div>
      <nav className="mt-4">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors ${currentView === id ? 'bg-blue-600' : ''}`}
          >
            <Icon className="w-5 h-5 mr-3" />
            {label}
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
