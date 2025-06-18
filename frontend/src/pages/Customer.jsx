import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [form, setForm] = useState({
    customer_code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      customer_code: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '',
      gender: ''
    });
    setEditMode(false);
    setCurrentCustomerId(null);
  };

  const generateCustomerCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CUST${year}${month}${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      customer_code: form.customer_code || generateCustomerCode(),
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      loyalty_points: 0,
      total_spent: 0.00,
      visit_count: 0,
      is_active: true
    };

    try {
      const url = editMode ? `/api/customers/${currentCustomerId}` : '/api/customers';
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const customerData = await res.json();
        
        if (editMode) {
          setCustomers(prev => prev.map(c => 
            c.id === currentCustomerId ? customerData : c
          ));
        } else {
          setCustomers(prev => [...prev, customerData]);
        }

        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleEdit = (customer) => {
    setForm({
      customer_code: customer.customer_code || '',
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      date_of_birth: customer.date_of_birth ? customer.date_of_birth.split('T')[0] : '',
      gender: customer.gender || ''
    });
    setCurrentCustomerId(customer.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus customer "${customer.name}"?`)) {
      try {
        const res = await fetch(`/api/customers/${customer.id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          setCustomers(prev => prev.filter(c => c.id !== customer.id));
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleView = (customer) => {
    setForm({
      customer_code: customer.customer_code || '',
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      date_of_birth: customer.date_of_birth ? customer.date_of_birth.split('T')[0] : '',
      gender: customer.gender || ''
    });
    setCurrentCustomerId(customer.id);
    setEditMode(false);
    setShowModal(true);
  };

  const handleAddNew = () => {
    resetForm();
    setForm(prev => ({ ...prev, customer_code: generateCustomerCode() }));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.customer_code && c.customer_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getModalTitle = () => {
    if (editMode) return 'Edit Customer';
    if (currentCustomerId && !editMode) return 'Detail Customer';
    return 'Tambah Customer';
  };

  const isViewMode = currentCustomerId && !editMode;

  return (
    <div>
      <Header title="Customers">
        <SearchBar 
          placeholder="Cari customer..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        <button 
          onClick={handleAddNew} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Customer
        </button>
      </Header>

      <div className="px-6">
        <Table
          headers={['Kode Customer', 'Nama', 'Email', 'Telepon', 'Total Belanja', 'Loyalty Points', 'Status']}
          data={filtered.map(c => ({
            id: c.id,
            customer_code: c.customer_code || '-',
            name: c.name,
            email: c.email || '-',
            phone: c.phone || '-',
            total_spent: formatCurrency(c.total_spent || 0),
            loyalty_points: c.loyalty_points || 0,
            status: c.is_active ? 'Aktif' : 'Nonaktif'
          }))}
          actions={[
            { 
              icon: Eye, 
              label: 'Lihat', 
              onClick: (row) => {
                const customer = customers.find(c => c.id === row.id);
                handleView(customer);
              }
            },
            { 
              icon: Edit, 
              label: 'Edit', 
              onClick: (row) => {
                const customer = customers.find(c => c.id === row.id);
                handleEdit(customer);
              }
            },
            { 
              icon: Trash2, 
              label: 'Hapus', 
              onClick: (row) => {
                const customer = customers.find(c => c.id === row.id);
                handleDelete(customer);
              }, 
              color: 'text-red-600' 
            }
          ]}
        />
      </div>

      <Modal title={getModalTitle()} isOpen={showModal} onClose={handleCloseModal}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Customer
              </label>
              <input 
                name="customer_code" 
                value={form.customer_code} 
                onChange={handleChange} 
                disabled={isViewMode}
                placeholder="Auto generate jika kosong"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Customer <span className="text-red-500">*</span>
              </label>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
              <input 
                type="date" 
                name="date_of_birth" 
                value={form.date_of_birth} 
                onChange={handleChange} 
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select 
                name="gender" 
                value={form.gender} 
                onChange={handleChange} 
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              rows="3"
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {isViewMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Belanja</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {formatCurrency(customers.find(c => c.id === currentCustomerId)?.total_spent || 0)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loyalty Points</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {customers.find(c => c.id === currentCustomerId)?.loyalty_points || 0} points
                </div>
              </div>
            </div>
          )}

          {isViewMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Kunjungan</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {customers.find(c => c.id === currentCustomerId)?.visit_count || 0} kali
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Daftar</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {formatDate(customers.find(c => c.id === currentCustomerId)?.created_at)}
                </div>
              </div>
            </div>
          )}

          {!isViewMode && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editMode ? 'Update' : 'Simpan'}
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Customers;