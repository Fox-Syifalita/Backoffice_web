import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSupplierId, setCurrentSupplierId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    payment_terms: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      tax_number: '',
      payment_terms: ''
    });
    setEditMode(false);
    setCurrentSupplierId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      contact_person: form.contact_person || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      tax_number: form.tax_number || null,
      payment_terms: form.payment_terms ? parseInt(form.payment_terms) : 30,
      is_active: true
    };

    try {
      const url = editMode ? `/api/suppliers/${currentSupplierId}` : '/api/suppliers';
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const supplierData = await res.json();
        
        if (editMode) {
          setSuppliers(prev => prev.map(s => 
            s.id === currentSupplierId ? supplierData : s
          ));
        } else {
          setSuppliers(prev => [...prev, supplierData]);
        }

        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleEdit = (supplier) => {
    setForm({
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      tax_number: supplier.tax_number || '',
      payment_terms: supplier.payment_terms || ''
    });
    setCurrentSupplierId(supplier.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (supplier) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus supplier "${supplier.name}"?`)) {
      try {
        const res = await fetch(`/api/suppliers/${supplier.id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const handleView = (supplier) => {
    // Set form dengan data supplier untuk view mode
    setForm({
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      tax_number: supplier.tax_number || '',
      payment_terms: supplier.payment_terms || ''
    });
    setCurrentSupplierId(supplier.id);
    setEditMode(false);
    setShowModal(true);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getModalTitle = () => {
    if (editMode) return 'Edit Supplier';
    if (currentSupplierId && !editMode) return 'Detail Supplier';
    return 'Tambah Supplier';
  };

  const isViewMode = currentSupplierId && !editMode;

  return (
    <div>
      <Header title="Suppliers">
        <SearchBar 
          placeholder="Cari supplier..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        <button 
          onClick={handleAddNew} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Supplier
        </button>
      </Header>

      <div className="px-6">
        <Table
          headers={['Nama', 'Kontak Person', 'Email', 'Telepon', 'Termin Pembayaran', 'Status']}
          data={filtered.map(s => ({
            id: s.id,
            name: s.name,
            contact_person: s.contact_person || '-',
            email: s.email || '-',
            phone: s.phone || '-',
            payment_terms: s.payment_terms ? `${s.payment_terms} hari` : '-',
            status: s.is_active ? 'Aktif' : 'Nonaktif'
          }))}
          actions={[
            { 
              icon: Eye, 
              label: 'Lihat', 
              onClick: (row) => {
                const supplier = suppliers.find(s => s.id === row.id);
                handleView(supplier);
              }
            },
            { 
              icon: Edit, 
              label: 'Edit', 
              onClick: (row) => {
                const supplier = suppliers.find(s => s.id === row.id);
                handleEdit(supplier);
              }
            },
            { 
              icon: Trash2, 
              label: 'Hapus', 
              onClick: (row) => {
                const supplier = suppliers.find(s => s.id === row.id);
                handleDelete(supplier);
              }, 
              color: 'text-red-600' 
            }
          ]}
        />
      </div>

      <Modal title={getModalTitle()} isOpen={showModal} onClose={handleCloseModal}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Supplier <span className="text-red-500">*</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Person</label>
              <input 
                name="contact_person" 
                value={form.contact_person} 
                onChange={handleChange} 
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NPWP</label>
              <input 
                name="tax_number" 
                value={form.tax_number} 
                onChange={handleChange} 
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Termin Pembayaran (hari)</label>
            <input 
              type="number" 
              name="payment_terms" 
              value={form.payment_terms} 
              onChange={handleChange} 
              min="0"
              placeholder="30"
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
            />
          </div>

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

export default Suppliers;