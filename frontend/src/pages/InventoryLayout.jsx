import React, { useState } from 'react';
import Products from './Products';
import StockMovement from './StockMovement';
import StockOpname from './StockOpname';
import BarcodePrint from './BarcodePrint';

const InventoryLayout = () => {
  const [tab, setTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Produk' },
    { id: 'stock-movement', label: 'Pergerakan Stok' },
    { id: 'stock-opname', label: 'Stok Opname' },
    { id: 'barcode', label: 'Cetak Barcode' }
  ];

  const renderTab = () => {
    switch (tab) {
      case 'products': return <Products />;
      case 'stock-movement': return <StockMovement />;
      case 'stock-opname': return <StockOpname />;
      case 'barcode': return <BarcodePrint />;
      default: return <Products />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex space-x-2 border-b bg-white px-6 pt-4">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {renderTab()}
      </div>
    </div>
  );
};

export default InventoryLayout;