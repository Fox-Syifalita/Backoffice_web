import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', category_id: '', price: '', cost: '', stock: '' });

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    name: form.name,
    sku: form.sku,
    category_id: form.category_id,
    cost_price: parseFloat(form.cost),
    selling_price: parseFloat(form.price),
    stock_quantity: parseInt(form.stock),
    is_active: true,
    track_stock: true,
    allow_negative_stock: false,
    unit: 'pcs',
    tax_rate: 0,
    barcode: '',          
  };

  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const newProduct = await res.json();
  setProducts(prev => [...prev, newProduct]);
  setShowModal(false);
  setForm({ name: '', sku: '', category_id: '', price: '', cost: '', stock: '' });
};


  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Header title="Products">
        <SearchBar placeholder="Search products..." value={searchTerm} onChange={setSearchTerm} />
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </button>
      </Header>

      <div className="px-6">
        <Table
          headers={['Name', 'SKU', 'Category', 'Stock', 'Price', 'Cost']}
          data={filtered.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: p.category,
            stock: p.stock,
            price: p.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            cost: p.cost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
          }))}
          actions={[
            { icon: Eye, label: 'View', onClick: (row) => console.log('View', row) },
            { icon: Edit, label: 'Edit', onClick: (row) => console.log('Edit', row) },
            { icon: Trash2, label: 'Delete', onClick: (row) => console.log('Delete', row), color: 'text-red-600' }
          ]}
        />
      </div>

      <Modal title="Add Product" isOpen={showModal} onClose={() => setShowModal(false)}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli</label>
              <input type="number" name="cost" value={form.cost} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
