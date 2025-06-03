import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import SalesChart from '../components/SalesChart';
import { TrendingUp, ShoppingCart, Package } from 'lucide-react';

const Dashboard = ({ stats, sales, lowStock }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Simulasi: Ambil data grafik dari sales
    const summary = sales.reduce((acc, curr) => {
      const date = curr.date;
      acc[date] = (acc[date] || 0) + curr.total;
      return acc;
    }, {});

    const formatted = Object.entries(summary).map(([date, total]) => ({
      date,
      total,
    }));

    setChartData(formatted);
  }, [sales]);

  return (
    <div>
      <Header title="Dashboard" />
      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Sales" value={stats.totalSales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} icon={TrendingUp} color="green" />
          <StatsCard title="Total Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} color="blue" />
          <StatsCard title="Products" value={stats.totalProducts.toLocaleString()} icon={Package} color="purple" />
          <StatsCard title="Low Stock Items" value={stats.lowStockItems.toLocaleString()} icon={Package} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart data={chartData} />

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Low Stock Alert</h3>
            <div className="space-y-3">
              {lowStock.map(product => (
                <div key={product.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-yellow-600'}`}>{product.stock} left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
