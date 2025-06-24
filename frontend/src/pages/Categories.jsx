import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    parent_id: '',
    is_active: true 
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: form.name,
        description: form.description,
        parent_id: form.parent_id || null,
        is_active: form.is_active
      };

      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updatedCategory = await res.json();
        
        if (editingCategory) {
          setCategories(prev => prev.map(cat => 
            cat.id === editingCategory.id ? updatedCategory : cat
          ));
        } else {
          setCategories(prev => [...prev, updatedCategory]);
        }

        handleCloseModal();
        alert('Kategori berhasil disimpan!');
      } else {
        throw new Error('Failed to save category');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Terjadi kesalahan saat menyimpan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || '',
      is_active: category.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${category.name}"?`)) {
      try {
        const res = await fetch(`/api/categories/${category.id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          setCategories(prev => prev.filter(cat => cat.id !== category.id));
          alert('Kategori berhasil dihapus!');
        } else {
          throw new Error('Failed to delete category');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Terjadi kesalahan saat menghapus kategori');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setForm({ name: '', description: '', parent_id: '', is_active: true });
    setIsSubmitting(false);
  };

  const getParentCategoryName = (parentId) => {
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : '-';
  };

  // Filter categories berdasarkan search term (ID atau nama)
  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Custom buttons untuk modal
  const modalButtons = (
    <>
      <button 
        type="button" 
        onClick={handleCloseModal}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
      >
        Batal
      </button>
      <button 
        type="submit"
        form="categoryForm"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-blue-400"
      >
        {isSubmitting ? 'Menyimpan...' : (editingCategory ? 'Update Kategori' : 'Simpan Kategori')}
      </button>
    </>
  );

  return (
    <div>
      <Header title="Categories">
        <SearchBar 
          placeholder="Search by ID, name, or description..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </button>
      </Header>

      <div className="px-6">
        <Table
          headers={['Name', 'Description', 'Parent Category', 'Status', 'Created At']}
          data={filtered.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description || '-',
            parent_category: getParentCategoryName(cat.parent_id),
            status: cat.is_active ? 
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span> :
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Inactive</span>,
            created_at: new Date(cat.created_at).toLocaleDateString('id-ID')
          }))}
          actions={[
            { 
              icon: Eye, 
              label: 'View', 
              onClick: (row) => {
                const category = categories.find(cat => cat.id === row.id);
                alert(`Category Details:\nID: ${category.id}\nName: ${category.name}\nDescription: ${category.description || 'N/A'}\nStatus: ${category.is_active ? 'Active' : 'Inactive'}`);
              }
            },
            { 
              icon: Edit, 
              label: 'Edit', 
              onClick: (row) => {
                const category = categories.find(cat => cat.id === row.id);
                handleEdit(category);
              }
            },
            { 
              icon: Trash2, 
              label: 'Delete', 
              onClick: (row) => {
                const category = categories.find(cat => cat.id === row.id);
                handleDelete(category);
              }, 
              color: 'text-red-600' 
            }
          ]}
        />
      </div>

      <Modal 
        title={editingCategory ? "Edit Category" : "Add Category"} 
        isOpen={showModal} 
        onClose={handleCloseModal}
        customButtons={modalButtons}
        size="md"
      >
        <form id="categoryForm" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
              placeholder="Masukkan nama kategori"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows={3}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
              placeholder="Masukkan deskripsi kategori (opsional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category
            </label>
            <select 
              name="parent_id" 
              value={form.parent_id} 
              onChange={handleChange} 
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Pilih Parent Category (Opsional)</option>
              {categories
                .filter(cat => editingCategory ? cat.id !== editingCategory.id : true)
                .map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
          </div>

          <div className="flex items-center">
            <input 
              type="checkbox" 
              name="is_active" 
              checked={form.is_active} 
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Kategori Aktif
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;