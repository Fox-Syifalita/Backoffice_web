import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Settings,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload
} from 'lucide-react';

// Mock data and API functions (replace with actual API calls)
const mockAuth = {
  user: { id: '1', name: 'Admin User', role: 'admin' },
  token: 'mock-token'
};

const mockProducts = [
  { id: '1', name: 'Coffee Latte', sku: 'COF001', barcode: '1234567890', category: 'Beverages', stock: 50, price: 4.50, cost: 2.00 },
  { id: '2', name: 'Chocolate Cake', sku: 'CAK001', barcode: '1234567891', category: 'Desserts', stock: 12, price: 8.99, cost: 4.50 },
  { id: '3', name: 'Green Tea', sku: 'TEA001', barcode: '1234567892', category: 'Beverages', stock: 30, price: 3.25, cost: 1.50 }
];

const mockCategories = [
  { id: '1', name: 'Beverages', products: 25 },
  { id: '2', name: 'Desserts', products: 15 },
  { id: '3', name: 'Snacks', products: 20 }
];

const mockSales = [
  { id: '1', transaction_number: 'TXN-001', customer: 'John Doe', total: 23.45, date: '2024-01-15', items: 3 },
  { id: '2', transaction_number: 'TXN-002', customer: 'Jane Smith', total: 45.67, date: '2024-01-15', items: 5 },
  { id: '3', transaction_number: 'TXN-003', customer: 'Bob Johnson', total: 12.99, date: '2024-01-14', items: 2 }
];

const POSBackOffice = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Dashboard Stats
  const dashboardStats = {
    totalSales: 15420.50,
    totalOrders: 342,
    totalProducts: 156,
    lowStockItems: 8
  };

  const Sidebar = () => (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">POS Back Office</h1>
        <p className="text-sm text-gray-400">{mockAuth.user.name}</p>
      </div>
      
      <nav className="mt-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'categories', label: 'Categories', icon: Package },
          { id: 'sales', label: 'Sales', icon: ShoppingCart },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
                currentView === item.id ? 'bg-blue-600' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
        
        <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors mt-8 text-red-400">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );

  const Header = ({ title, children }) => (
    <div className="bg-white shadow-sm border-b px-6 py-4 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <div className="flex space-x-2">
          {children}
        </div>
      </div>
    </div>
  );

  const SearchBar = ({ placeholder = "Search..." }) => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
      />
    </div>
  );

const StatsCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const bgColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColors[color] || bgColors.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

  const Table = ({ headers, data, actions }) => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cell}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {actions.map((action, actionIndex) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(row)}
                          className={`p-1 rounded hover:bg-gray-100 ${action.color || 'text-gray-600'}`}
                          title={action.label}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const Modal = ({ title, children, isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="p-6">
            {children}
          </div>
          <div className="px-6 py-4 border-t flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div>
      <Header title="Dashboard" />
      
      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Sales" 
            value={`$${dashboardStats.totalSales.toLocaleString()}`}
            icon={TrendingUp}
            color="green"
          />
          <StatsCard 
            title="Total Orders" 
            value={dashboardStats.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            color="blue"
          />
          <StatsCard 
            title="Products" 
            value={dashboardStats.totalProducts.toLocaleString()}
            icon={Package}
            color="purple"
          />
          <StatsCard 
            title="Low Stock Items" 
            value={dashboardStats.lowStockItems.toLocaleString()}
            icon={Package}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
            <div className="space-y-3">
              {mockSales.slice(0, 5).map(sale => (
                <div key={sale.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{sale.transaction_number}</p>
                    <p className="text-sm text-gray-600">{sale.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${sale.total}</p>
                    <p className="text-sm text-gray-600">{sale.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Low Stock Alert</h3>
            <div className="space-y-3">
              {mockProducts.filter(p => p.stock < 20).map(product => (
                <div key={product.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {product.stock} left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <Header title="Products">
        <SearchBar placeholder="Search products..." />
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {mockCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </Header>

      <div className="px-6">
        <Table
          headers={['Name', 'SKU', 'Category', 'Stock', 'Price', 'Cost']}
          data={mockProducts.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: p.category,
            stock: p.stock,
            price: `$${p.price}`,
            cost: `$${p.cost}`
          }))}
          actions={[
            { icon: Eye, label: 'View', onClick: (row) => console.log('View', row) },
            { icon: Edit, label: 'Edit', onClick: (row) => console.log('Edit', row) },
            { icon: Trash2, label: 'Delete', onClick: (row) => console.log('Delete', row), color: 'text-red-600' }
          ]}
        />
      </div>

      <Modal 
        title="Add New Product" 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
              <option>Select Category</option>
              {mockCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );

  const renderSales = () => (
    <div>
      <Header title="Sales Transactions">
        <SearchBar placeholder="Search transactions..." />
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </Header>

      <div className="px-6">
        <Table
          headers={['Transaction #', 'Customer', 'Items', 'Total', 'Date']}
          data={mockSales.map(s => ({
            id: s.id,
            transaction_number: s.transaction_number,
            customer: s.customer,
            items: s.items,
            total: `$${s.total}`,
            date: s.date
          }))}
          actions={[
            { icon: Eye, label: 'View Details', onClick: (row) => console.log('View', row) },
            { icon: Download, label: 'Print Receipt', onClick: (row) => console.log('Print', row) }
          ]}
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return renderProducts();
      case 'sales':
        return renderSales();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default POSBackOffice;