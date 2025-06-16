import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Eye, Edit, Trash2, Package, RotateCcw } from 'lucide-react';

const initialSupplierForm = {
  name: '', contact_person: '', email: '', phone: '', address: '', tax_number: '',
};

const initialProductForm = {
  name: '', sku: '', selling_price: '', cost_price: '', unit: 'pcs', stock_quantity: 0,
};

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState(initialSupplierForm);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [productTargetIndex, setProductTargetIndex] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [activeTab, setActiveTab] = useState('purchases');
  const [returns, setReturns] = useState([]);

  const [form, setForm] = useState({
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    notes: '',
    items: [{ product_id: '', quantity_ordered: '', unit_cost: '' }]
  });

  const [returnForm, setReturnForm] = useState({
    purchase_id: '', reason: '', notes: '', items: []
  });

  useEffect(() => {
    fetchPurchases(); fetchSuppliers(); fetchProducts(); fetchReturns();
  }, []);

  const fetchPurchases = async () => {
    const res = await fetch('/api/purchases');
    const data = await res.json();
    setPurchases(data);
  };

  const fetchSuppliers = async () => {
    const res = await fetch('/api/suppliers');
    const data = await res.json();
    setSuppliers(data);
  };

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const fetchReturns = async () => {
    const res = await fetch('/api/purchase-returns');
    const data = await res.json();
    setReturns(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    if (value === '__add_new__' && field === 'product_id') {
      setProductTargetIndex(index);
      setShowNewProductModal(true);
      return;
    }
    newItems[index][field] = value;
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { product_id: '', quantity_ordered: '', unit_cost: '' }] }));
  };

  const removeItem = (index) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const calculateTotal = () => {
    return form.items.reduce((total, item) => {
      return total + (parseFloat(item.quantity_ordered || 0) * parseFloat(item.unit_cost || 0));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      total_amount: calculateTotal(),
      subtotal: calculateTotal(),
      status: 'pending'
    };
    const res = await fetch('/api/purchases', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const newPurchase = await res.json();
      setPurchases(prev => [...prev, newPurchase]);
      setShowModal(false);
      setForm({
        supplier_id: '', order_date: new Date().toISOString().split('T')[0],
        expected_date: '', notes: '',
        items: [{ product_id: '', quantity_ordered: '', unit_cost: '' }]
      });
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/suppliers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplierForm)
    });
    if (res.ok) {
      const newSupplier = await res.json();
      setSuppliers(prev => [...prev, newSupplier]);
      setForm(prev => ({ ...prev, supplier_id: newSupplier.id }));
      setShowNewSupplierModal(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm)
    });
    if (res.ok) {
      const newProduct = await res.json();
      setProducts(prev => [...prev, newProduct]);
      if (productTargetIndex !== null) {
        const newItems = [...form.items];
        newItems[productTargetIndex].product_id = newProduct.id;
        setForm(prev => ({ ...prev, items: newItems }));
      }
      setShowNewProductModal(false);
    }
  };

  const handleReturn = (purchase) => {
    setSelectedPurchase(purchase);
    setReturnForm({
      purchase_id: purchase.id,
      reason: '',
      notes: '',
      items: purchase.items?.map(item => ({ ...item, return_quantity: 0 })) || []
    });
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/purchase-returns', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnForm)
    });
    if (res.ok) {
      fetchReturns();
      setShowReturnModal(false);
    }
  };

  const getDateFilteredData = (data) => {
    if (dateFilter === 'all') return data;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (dateFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.order_date || item.return_date) >= filterDate);
  };

  const filteredPurchases = getDateFilteredData(purchases.filter(p => {
    const matchesSearch = p.purchase_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }));

  const filteredReturns = getDateFilteredData(returns.filter(r => {
    const matchesSearch = r.return_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.purchase_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }));

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <div>
      <Header title="Pembelian">
        <div className="flex items-center space-x-3">
          <SearchBar 
            placeholder="Cari pembelian..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="received">Diterima</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Periode</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
            <option value="quarter">3 Bulan Terakhir</option>
          </select>

          {activeTab === 'purchases' ? (
            <button 
              onClick={() => setShowModal(true)} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Pembelian
            </button>
          ) : (
            <button 
              onClick={() => setShowReturnModal(true)} 
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Retur
            </button>
          )}
        </div>
      </Header>

      <div className="px-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-2 px-4 font-medium border-b-2 ${
              activeTab === 'purchases' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Pembelian
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`py-2 px-4 font-medium border-b-2 ${
              activeTab === 'returns' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Retur
          </button>
        </div>

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <Table
            headers={['No. Pembelian', 'Supplier', 'Tanggal', 'Total', 'Status', 'Catatan']}
            data={filteredPurchases.map(p => ({
              id: p.id,
              purchase_number: p.purchase_number,
              supplier_name: p.supplier_name,
              order_date: new Date(p.order_date).toLocaleDateString('id-ID'),
              total_amount: p.total_amount?.toLocaleString('id-ID', { 
                style: 'currency', 
                currency: 'IDR' 
              }),
              status: getStatusBadge(p.status),
              notes: p.notes || '-'
            }))}
            actions={[
              { 
                icon: Eye, 
                label: 'Detail', 
                onClick: (row) => console.log('View purchase:', row) 
              },
              { 
                icon: Edit, 
                label: 'Edit', 
                onClick: (row) => console.log('Edit purchase:', row) 
              },
              { 
                icon: RotateCcw, 
                label: 'Retur', 
                onClick: (row) => handleReturn(row),
                color: 'text-orange-600'
              },
              { 
                icon: Trash2, 
                label: 'Hapus', 
                onClick: (row) => console.log('Delete purchase:', row), 
                color: 'text-red-600' 
              }
            ]}
          />
        )}

        {/* Returns Tab */}
        {activeTab === 'returns' && (
          <Table
            headers={['No. Retur', 'No. Pembelian', 'Supplier', 'Tanggal', 'Total', 'Alasan']}
            data={filteredReturns.map(r => ({
              id: r.id,
              return_number: r.return_number,
              purchase_number: r.purchase_number,
              supplier_name: r.supplier_name,
              return_date: new Date(r.return_date).toLocaleDateString('id-ID'),
              total_amount: r.total_amount?.toLocaleString('id-ID', { 
                style: 'currency', 
                currency: 'IDR' 
              }),
              reason: r.reason
            }))}
            actions={[
              { 
                icon: Eye, 
                label: 'Detail', 
                onClick: (row) => console.log('View return:', row) 
              },
              { 
                icon: Trash2, 
                label: 'Hapus', 
                onClick: (row) => console.log('Delete return:', row), 
                color: 'text-red-600' 
              }
            ]}
          />
        )}
      </div>

      {/* Add Purchase Modal */}
      <Modal title="Tambah Pembelian" isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select 
                name="supplier_id" 
                value={form.supplier_id} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pesan</label>
              <input 
                type="date" 
                name="order_date" 
                value={form.order_date} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Diharapkan</label>
            <input 
              type="date" 
              name="expected_date" 
              value={form.expected_date} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <button 
                type="button" 
                onClick={addItem}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Tambah Item
              </button>
            </div>
            
            {form.items.map((item, index) => (
              <div key={index} className="border p-3 rounded-md mb-2 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <select 
                      value={item.product_id} 
                      onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      required
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">Pilih Produk</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input 
                      type="number" 
                      placeholder="Jumlah"
                      value={item.quantity_ordered} 
                      onChange={(e) => handleItemChange(index, 'quantity_ordered', e.target.value)}
                      required
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <input 
                      type="number" 
                      placeholder="Harga"
                      value={item.unit_cost} 
                      onChange={(e) => handleItemChange(index, 'unit_cost', e.target.value)}
                      required
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-semibold">
              Total: {calculateTotal().toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            </div>
            <div className="flex space-x-2">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal title="Retur Pembelian" isOpen={showReturnModal} onClose={() => setShowReturnModal(false)}>
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Retur</label>
            <select 
              value={returnForm.reason} 
              onChange={(e) => setReturnForm(prev => ({ ...prev, reason: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Alasan</option>
              <option value="damaged">Barang Rusak</option>
              <option value="wrong_item">Barang Salah</option>
              <option value="defective">Cacat Produksi</option>
              <option value="expired">Kadaluarsa</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea 
              value={returnForm.notes} 
              onChange={(e) => setReturnForm(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={() => setShowReturnModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Proses Retur
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchases;