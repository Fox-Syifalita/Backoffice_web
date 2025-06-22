import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Table from '../components/Table';
import { Calendar, Download, Filter, BarChart3, Package, Users, Truck, Handshake, ShoppingCart } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales-sku');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: 'daily' // daily, monthly, yearly
  });

  const reportTabs = [
    { id: 'sales-sku', label: 'Penjualan per SKU', icon: Package },
    { id: 'sales-category', label: 'Penjualan per Kategori', icon: BarChart3 },
    { id: 'sales-supplier', label: 'Penjualan per Supplier', icon: Truck },
    { id: 'consignment', label: 'Laporan Konsinyasi', icon: Handshake },
    { id: 'purchase', label: 'Laporan Pembelian', icon: ShoppingCart }
  ];

  useEffect(() => {
    fetchReportData();
  }, [activeTab, filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        period: filters.period
      });
      
      const response = await fetch(`/api/reports/${activeTab}?${queryParams}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const exportToCSV = () => {
    if (!reportData.length) return;
    
    const headers = getTableHeaders();
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => {
          const value = row[header.toLowerCase().replace(' ', '_')] || '';
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_${activeTab}_${filters.startDate}_${filters.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'sales-sku':
        return ['SKU', 'Nama Produk', 'Kategori', 'Qty Terjual', 'Total Penjualan', 'Profit'];
      case 'sales-category':
        return ['Kategori', 'Jumlah Produk', 'Qty Terjual', 'Total Penjualan', 'Rata-rata Harga'];
      case 'sales-supplier':
        return ['Supplier', 'Jumlah Produk', 'Qty Terjual', 'Total Penjualan', 'Profit'];
      case 'consignment':
        return ['Supplier', 'Produk', 'Qty Konsinyasi', 'Qty Terjual', 'Komisi', 'Total Komisi'];
      case 'purchase':
        return ['Supplier', 'No. Purchase', 'Tanggal', 'Total Items', 'Total Pembelian', 'Status'];
      default:
        return [];
    }
  };

  const getTableData = () => {
    return reportData.map(item => {
      switch (activeTab) {
        case 'sales-sku':
          return {
            id: item.sku,
            sku: item.sku,
            nama_produk: item.product_name,
            kategori: item.category_name || '-',
            qty_terjual: item.quantity_sold?.toLocaleString() || '0',
            total_penjualan: item.total_sales?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp 0',
            profit: item.profit?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp 0'
          };
        case 'sales-category':
          return {
            id: item.category_id,
            kategori: item.category_name,
            jumlah_produk: item.product_count?.toLocaleString() || '0',
            qty_terjual: item.quantity_sold?.toLocaleString() || '0',
            total_penjualan: item.total_sales?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp 0',
            'rata-rata_harga': item.average_price?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp 0'
          };
        case 'sales-supplier':
          return {
            id: item.supplier_id,
            supplier: item.supplier_name || 'Tidak Ada Supplier',
            jumlah_produk: item.product_count?.toLocaleString() || '0',
            qty_terjual: item.quantity_sold?.toLocaleString() || '0',
            total_penjualan: item.total_sales?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp 0',
            profit: item.profit?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp 0'
          };
        case 'consignment':
          return {
            id: item.consignment_id,
            supplier: item.supplier_name,
            produk: item.product_name,
            qty_konsinyasi: item.quantity_consigned?.toLocaleString() || '0',
            qty_terjual: item.quantity_sold?.toLocaleString() || '0',
            komisi: `${item.commission_rate}%`,
            total_komisi: item.total_commission?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp 0'
          };
        case 'purchase':
          return {
            id: item.purchase_id,
            supplier: item.supplier_name,
            'no._purchase': item.purchase_number,
            tanggal: new Date(item.order_date).toLocaleDateString('id-ID'),
            total_items: item.total_items?.toLocaleString() || '0',
            total_pembelian: item.total_amount?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp 0',
            status: item.status === 'received' ? 'Diterima' : item.status === 'pending' ? 'Pending' : 'Dibatalkan'
          };
        default:
          return item;
      }
    });
  };

  const renderFilters = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter Periode:</span>
        </div>
        
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          />
          <span className="self-center text-gray-500">s/d</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filters.period}
          onChange={(e) => handleFilterChange('period', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Harian</option>
          <option value="monthly">Bulanan</option>
          <option value="yearly">Tahunan</option>
        </select>

        <button
          onClick={exportToCSV}
          disabled={!reportData.length}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>
    </div>
  );

  const renderTabNavigation = () => (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  const renderSummaryCards = () => {
    const getSummaryData = () => {
      if (!reportData.length) return null;
      
      switch (activeTab) {
        case 'sales-sku':
        case 'sales-category':
        case 'sales-supplier':
          const totalSales = reportData.reduce((sum, item) => sum + (item.total_sales || 0), 0);
          const totalProfit = reportData.reduce((sum, item) => sum + (item.profit || 0), 0);
          const totalQty = reportData.reduce((sum, item) => sum + (item.quantity_sold || 0), 0);
          
          return [
            { label: 'Total Penjualan', value: totalSales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }), color: 'bg-blue-500' },
            { label: 'Total Profit', value: totalProfit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }), color: 'bg-green-500' },
            { label: 'Total Qty Terjual', value: totalQty.toLocaleString(), color: 'bg-purple-500' },
            { label: 'Jumlah Item', value: reportData.length.toLocaleString(), color: 'bg-orange-500' }
          ];
        
        case 'consignment':
          const totalCommission = reportData.reduce((sum, item) => sum + (item.total_commission || 0), 0);
          const totalConsigned = reportData.reduce((sum, item) => sum + (item.quantity_consigned || 0), 0);
          const totalSold = reportData.reduce((sum, item) => sum + (item.quantity_sold || 0), 0);
          
          return [
            { label: 'Total Komisi', value: totalCommission.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }), color: 'bg-blue-500' },
            { label: 'Qty Konsinyasi', value: totalConsigned.toLocaleString(), color: 'bg-orange-500' },
            { label: 'Qty Terjual', value: totalSold.toLocaleString(), color: 'bg-green-500' },
            { label: 'Tingkat Penjualan', value: `${totalConsigned > 0 ? ((totalSold / totalConsigned) * 100).toFixed(1) : 0}%`, color: 'bg-purple-500' }
          ];
        
        case 'purchase':
          const totalPurchases = reportData.reduce((sum, item) => sum + (item.total_amount || 0), 0);
          const totalItems = reportData.reduce((sum, item) => sum + (item.total_items || 0), 0);
          const receivedCount = reportData.filter(item => item.status === 'received').length;
          
          return [
            { label: 'Total Pembelian', value: totalPurchases.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }), color: 'bg-blue-500' },
            { label: 'Total Items', value: totalItems.toLocaleString(), color: 'bg-orange-500' },
            { label: 'Order Diterima', value: receivedCount.toLocaleString(), color: 'bg-green-500' },
            { label: 'Total Order', value: reportData.length.toLocaleString(), color: 'bg-purple-500' }
          ];
        
        default:
          return null;
      }
    };

    const summaryData = getSummaryData();
    if (!summaryData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryData.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className={`${item.color} p-3 rounded-lg`}>
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Header title="Laporan">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          Periode: {new Date(filters.startDate).toLocaleDateString('id-ID')} - {new Date(filters.endDate).toLocaleDateString('id-ID')}
        </div>
      </Header>

      <div className="px-6">
        {renderTabNavigation()}
        {renderFilters()}
        {renderSummaryCards()}
        
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
          ) : (
            <Table
              headers={getTableHeaders()}
              data={getTableData()}
              emptyMessage={`Tidak ada data laporan ${reportTabs.find(tab => tab.id === activeTab)?.label.toLowerCase()}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;