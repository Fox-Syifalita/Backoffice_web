import React, { useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Settings,
  Truck,
  TruckIcon,
  User2,
  Menu, 
  ChevronLeft, 
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory and Products', icon: Package },
  { id: 'purchases', label: 'Purchase', icon: TruckIcon},
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'supplier', label: 'Supplier', icon: Truck },
  { id: 'reports', label: 'Reports', icon: TrendingUp },
  { id: 'employee', label: 'Employee', icon: User2},
  { id: 'settings', label: 'Settings', icon: Settings }
];

const Sidebar = ({ currentView, setCurrentView, user, isSidebarPinned, toggleSidebarPin }) => {
  
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = isSidebarPinned || isHovered;

  return (
    <div 
      className={`fixed top-0 left-0 h-screen bg-gray-800 text-white transition-all duration-300 z-50
      ${isOpen ? 'w-64' : 'w-20'} overflow-x-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Sidebar */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700 h-[65px]">
        {isOpen && (
           <div className="flex-grow">
             <h1 className="text-xl font-bold">Back Office</h1>
             <p className="text-sm text-gray-400 truncate">{user?.name}</p>
           </div>
        )}
        <button onClick={toggleSidebarPin} className="p-2 hover:bg-gray-700 rounded-full">
          {/* Ganti ikon berdasarkan status pin */}
          {isSidebarPinned ? <ChevronLeft size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* Menu Navigasi */}
      <nav className="mt-4 flex flex-col justify-between h-[calc(100vh-130px)]">
        <div>
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex items-center w-full text-left px-6 py-3 hover:bg-gray-700 ${
                currentView === id ? 'bg-gray-700 border-r-4 border-blue-500' : ''
              }`}
              title={label} // Tooltip untuk saat sidebar diciutkan
            >
              <Icon size={20} />
              {isOpen && <span className="ml-4 whitespace-nowrap">{label}</span>}
            </button>
          ))}
        </div>
        
        {/* Tombol Logout di Bagian Bawah */}
        <div className="px-6 py-4 border-t border-gray-700">
          <LogoutButton 
            onLogout={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }} 
            isSidebarOpen={isOpen}
          />
        </div>  
      </nav>
    </div>
  );
};

export default Sidebar;