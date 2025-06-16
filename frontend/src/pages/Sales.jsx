import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Eye, RefreshCw, X, DollarSign, Calendar, Hash, CheckCircle, XCircle, Clock } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('completed');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sales data
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sales');
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sale items for detail modal
  const fetchSaleItems = async (saleId) => {
    try {
      const response = await fetch(`/api/sales/${saleId}/items`);
      const data = await response.json();
      setSaleItems(data);
    } catch (error) {
      console.error('Error fetching sale items:', error);
    }
  };

  // Handle view detail
  const handleViewDetail = async (row) => {
    setSelectedSale(row);
    await fetchSaleItems(row.id);
    setShowDetailModal(true);
  };

  // Filter sales based on active tab and search term
  const filteredSales = sales.filter(sale => {
    const matchesTab = activeTab === 'completed' ? sale.status === 'completed' :
                      activeTab === 'refunded' ? sale.status === 'refunded' :
                      activeTab === 'cancelled' ? sale.status === 'cancelled' : true;
    
    const matchesSearch = sale.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Selesai' },
      refunded: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw, text: 'Dikembalikan' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Dibatalkan' },
      pending: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Menunggu' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Get payment status
  const getPaymentStatus = (paidAmount, totalAmount) => {
    const isPaid = paidAmount >= totalAmount;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isPaid ? 'Lunas' : 'Belum Lunas'}
      </span>
    );
  };

  // Calculate remaining payment
  const getRemainingPayment = (paidAmount, totalAmount) => {
    const remaining = totalAmount - paidAmount;
    return remaining > 0 ? remaining : 0;
  };

  // Tab configuration
  const tabs = [
    { id: 'completed', label: 'Selesai', icon: CheckCircle },
    { id: 'refunded', label: 'Pengembalian', icon: RefreshCw },
    { id: 'cancelled', label: 'Dibatalkan', icon: XCircle }
  ];

  return (
    <div>
      <Header title="Penjualan">
        <SearchBar 
          placeholder="Cari nomor transaksi atau nama pelanggan..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
      </Header>

      <div className="px-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const count = sales.filter(sale => sale.status === tab.id).length;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* Sales Table */
          <Table
            headers={[
              'No. Transaksi', 
              'Tanggal', 
              'Pelanggan', 
              'Total', 
              'Dibayar',
              'Sisa',
              'Status Bayar',
              'Status', 
              'Kasir'
            ]}
            data={filteredSales.map(sale => ({
              id: sale.id,
              transaction_number: (
                <div className="flex items-center">
                  <Hash className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-mono text-sm">{sale.transaction_number}</span>
                </div>
              ),
              date: (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{formatDate(sale.transaction_date)}</span>
                </div>
              ),
              customer: sale.customer_name || 'Umum',
              total: (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="font-semibold">{formatCurrency(sale.total_amount)}</span>
                </div>
              ),
              paid: formatCurrency(sale.paid_amount),
              remaining: formatCurrency(getRemainingPayment(sale.paid_amount, sale.total_amount)),
              payment_status: getPaymentStatus(sale.paid_amount, sale.total_amount),
              status: getStatusBadge(sale.status),
              cashier: sale.cashier_name || 'Unknown'
            }))}
            actions={[
              { 
                icon: Eye, 
                label: 'Detail', 
                onClick: handleViewDetail,
                color: 'text-blue-600'
              }
            ]}
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal 
        title={`Detail Transaksi - ${selectedSale?.transaction_number}`}
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)}
        size="lg"
      >
        {selectedSale && (
          <div className="space-y-6">
            {/* Transaction Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">No. Transaksi</label>
                <p className="text-sm text-gray-900 font-mono">{selectedSale.transaction_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                <p className="text-sm text-gray-900">{formatDate(selectedSale.date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pelanggan</label>
                <p className="text-sm text-gray-900">{selectedSale.customer || 'Umum'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kasir</label>
                <p className="text-sm text-gray-900">{selectedSale.cashier}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
                <p className="text-sm text-gray-900 capitalize">{selectedSale.payment_method || 'Cash'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(selectedSale.status)}</div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Item Pembelian</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diskon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {saleItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {item.product_sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.discount_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(selectedSale.total - selectedSale.tax_amount + selectedSale.discount_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diskon:</span>
                    <span className="text-red-600">-{formatCurrency(selectedSale.discount_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pajak:</span>
                    <span>{formatCurrency(selectedSale.tax_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedSale.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Dibayar:</span>
                    <span>{formatCurrency(selectedSale.paid)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kembalian:</span>
                    <span>{formatCurrency(selectedSale.change_amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedSale.notes && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <p className="text-sm text-gray-900">{selectedSale.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;