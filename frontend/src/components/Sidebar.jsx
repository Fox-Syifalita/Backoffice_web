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
  TruckIcon,
  User2
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'products', label: 'Inventory and Products', icon: Package },
  { id: 'purchases', label: 'Purchase', icon: TruckIcon},
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'supplier', label: 'Supplier', icon: Truck },
  { id: 'reports', label: 'Reports', icon: TrendingUp },
  { id: 'employee', label: 'Employee', icon: User2},
  { id: 'settings', label: 'Settings', icon: Settings }
];

const Sidebar = ({ currentView, setCurrentView, user, isSidebarOpen, toggleSidebar}) => {
  return (
    <div 
      className={`fixed top-0 left-0 h-screen bg-gray-800 text-white transition-all duration-300
      ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}
    >
     <div className="p-4 border-b border-gray-700">
    <h1 className="text-xl font-bold">Back Office</h1>
    <p className="text-sm text-gray-400">{user?.name}</p>
    </div>

      <nav className="mt-4">
        {menuItems.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
              currentView === id ? 'bg-gray-700' : ''
            }`}
          >
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
