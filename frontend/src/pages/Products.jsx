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
  const [form, setForm] = useState({ name: '', sku: '', barcode: '', category_id: '', price: '', cost: '', stock: '' });
  const [editId, setEditId] = useState(null);


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
  try{
  const payload = {
    name: form.name,
    sku: form.sku,
    barcode: form.barcode,
    category_id: form.category_id,
    cost_price: parseFloat(form.cost),
    selling_price: parseFloat(form.price),
    stock_quantity: parseInt(form.stock),
    is_active: true,
    track_stock: true,
    allow_negative_stock: false,
    unit: 'pcs',
    tax_rate: 0,          
  };

  const res = await fetch(`/api/products${editId ? `/${editId}` : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) throw new Error('Gagal menyimpan produk');
    const data = await res.json();

    if (editId) {
      setProducts((prev) => prev.map(p => (p.id === editId ? data : p)));
    } else {
      setProducts((prev) => [...prev, data]);
    }

    setEditId(null);
    setShowModal(false);
    setForm({ name: '', sku: '', barcode: '', category_id: '', price: '', cost: '', stock: '' });
  } catch (err) {
    console.error('Error: ', err);
    alert('Terjadi kesalahan saat menyimpan produk');
  }
};

const handleView = (product) => {
  alert(`Nama: ${product.name}
SKU: ${product.sku}
Barcode: ${product.barcode}
Modal: ${formatRupiah(product.cost_price)}
Harga Jual: ${formatRupiah(product.selling_price)}`);
};

const handleEdit = (product) => {
  setForm({
    name: product.name,
    sku: product.sku,
    barcode: product.barcode || '',
    category_id: product.category_id,
    price: product.selling_price,
    cost: product.cost_price,
    stock: product.stock_quantity
  });
  setEditId(product.id);
  setShowModal(true);
};

const handleDelete = async (product) => {
  const confirmDelete = confirm(`Hapus produk ${product.name}?`);
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal menghapus produk');

    setProducts(prev => prev.filter(p => p.id !== product.id));
    alert('Produk berhasil dihapus');
  } catch (err) {
    console.error('Gagal hapus:', err);
    alert('Gagal menghapus produk');
  }
};

const getCategoryName = (categoryId) => {
  const found = categories.find((cat) => cat.id === categoryId);
  return found ? found.name : 'Tidak diketahui';
}

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (value) =>
  typeof value === 'number' ? value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : 'Rp 0';

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
          headers={['Name', 'SKU', 'Barcode', 'Category', 'Stock', 'Price', 'Cost']}
          data={products.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            barcode: p.barcode,
            category: getCategoryName(p.category_id),
            stock: p.stock_quantity,
            price: formatRupiah(Number(p.selling_price)),
            cost: formatRupiah(Number(p.cost_price)),
            _raw: p
          }))}
          actions={[
            { icon: Eye, label: 'View', onClick: handleView },
            { icon: Edit, label: 'Edit', onClick: handleEdit},
            { icon: Trash2, label: 'Delete', onClick: handleDelete, color: 'text-red-600' }
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
              <input name="sku" value={form.sku} onChange={handleChange} required className="w-full px-3 py- 2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
              <input name="barcode" value={form.barcode} onChange={handleChange} required className="w-full px-3 py- 2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
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
          <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
