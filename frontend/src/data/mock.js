// File: src/data/mock.js
export const mockAuth = {
  user: { id: '1', name: 'Admin User', role: 'admin' },
  token: 'mock-token'
};

export const mockProducts = [
  { id: '1', name: 'Coffee Latte', sku: 'COF001', category: 'Beverages', stock: 50, price: 4500, cost: 2000 },
  { id: '2', name: 'Chocolate Cake', sku: 'CAK001', category: 'Desserts', stock: 12, price: 8990, cost: 4500 },
  { id: '3', name: 'Green Tea', sku: 'TEA001', category: 'Beverages', stock: 30, price: 3250, cost: 1500 }
];

export const mockCategories = [
  { id: '1', name: 'Beverages', products: 25 },
  { id: '2', name: 'Desserts', products: 15 },
  { id: '3', name: 'Snacks', products: 20 }
];

export const mockSales = [
  { id: '1', transaction_number: 'TXN-001', customer: 'John Doe', total: 23450, date: '2024-01-15', items: 3 },
  { id: '2', transaction_number: 'TXN-002', customer: 'Jane Smith', total: 45670, date: '2024-01-15', items: 5 },
  { id: '3', transaction_number: 'TXN-003', customer: 'Bob Johnson', total: 12990, date: '2024-01-14', items: 2 }
];

export const dashboardStats = {
  totalSales: 1542050,
  totalOrders: 342,
  totalProducts: 156,
  lowStockItems: 8
};
