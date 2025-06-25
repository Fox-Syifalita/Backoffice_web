import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { Plus, Eye, Edit, Save, X, AlertTriangle } from 'lucide-react';

const StockOpname = () => {
  const [opnames, setOpnames] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOpname, setSelectedOpname] = useState(null);
  const [opnameItems, setOpnameItems] = useState([]);
  const [form, setForm] = useState({ 
    opname_number: '', 
    description: '', 
    status: 'draft' 
  });


  useEffect(() => {
    fetchOpnames();
    fetchProducts();
  }, []);

  const fetchOpnames = async () => {
    try {
      const res = await fetch('/api/opname');
      const data = await res.json();
      setOpnames(data);
    } catch (err) {
      console.error('Error fetching opnames:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOpnameItems = async (opnameId) => {
    try {
      const res = await fetch(`/api/opname/${opnameId}/items`);
      const data = await res.json();
      setOpnameItems(data);
    } catch (err) {
      console.error('Error fetching opname items:', err);
    }
  };

  const generateOpnameNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SO-${year}${month}${day}-${random}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        opname_number: form.opname_number || generateOpnameNumber(),
        description: form.description,
        status: 'draft',
        opname_date: new Date().toISOString().split('T')[0]
      };

      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `/api/opname/${selectedOpname.id}` : '/api/opname';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        if (editMode) {
          setOpnames(prev => prev.map(op => 
            op.id === selectedOpname.id ? result : op
          ));
        } else {
          setOpnames(prev => [...prev, result]);
        }
        resetForm();
        alert('Stock opname berhasil disimpan');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Terjadi kesalahan saat menyimpan stock opname');
    }
  };

  const handleView = async (opname) => {
    setSelectedOpname(opname);
    await fetchOpnameItems(opname.id);
    setShowDetailModal(true);
  };

  const handleEdit = (opname) => {
    setSelectedOpname(opname);
    setForm({
      opname_number: opname.opname_number,
      description: opname.description,
      status: opname.status
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleStatusChange = async (opnameId, newStatus) => {
    try {
      const res = await fetch(`/api/opname/${opnameId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOpnames(prev => prev.map(op => 
          op.id === opnameId ? { ...op, status: newStatus } : op
        ));
        
        if (newStatus === 'completed') {
          alert('Stock opname telah diselesaikan dan stok telah diupdate');
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Terjadi kesalahan saat mengubah status');
    }
  };

  const handleItemCountChange = async (itemId, physicalCount) => {
    try {
      const res = await fetch(`/api/opname/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ physical_count: parseInt(physicalCount) })
      });

      if (res.ok) {
        setOpnameItems(prev => prev.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                physical_count: parseInt(physicalCount),
                variance: parseInt(physicalCount) - item.system_count,
                status: parseInt(physicalCount) === item.system_count ? 'match' : 'variance'
              } 
            : item
        ));
      }
    } catch (err) {
      console.error('Error updating item count:', err);
    }
  };

  const startOpname = async (opnameId) => {
    try {
      // Auto-populate dengan semua produk aktif
      const res = await fetch(`/api/opname/${opnameId}/populate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        await handleStatusChange(opnameId, 'in_progress');
        await fetchOpnameItems(opnameId);
      }
    } catch (err) {
      console.error('Error starting opname:', err);
      alert('Terjadi kesalahan saat memulai stock opname');
    }
  };

  const resetForm = () => {
    setForm({ opname_number: '', description: '', status: 'draft' });
    setShowModal(false);
    setEditMode(false);
    setSelectedOpname(null);
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      draft: 'Draft',
      in_progress: 'Sedang Berjalan',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getVarianceColor = (variance) => {
    if (variance === 0) return 'text-green-600';
    if (variance > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  const filtered = opnames.filter(op =>
    op.opname_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (value) =>
    typeof value === 'number' ? value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : 'Rp 0';

  return (
    <div>
      <Header title="Stock Opname">
        <SearchBar 
          placeholder="Cari stock opname..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Buat Stock Opname
        </button>
      </Header>

      <div className="px-6">
        <Table
          headers={['No. Opname', 'Tanggal', 'Deskripsi', 'Status', 'Total Item', 'Aksi']}
          data={filtered.map(op => ({
            id: op.id,
            opname_number: op.opname_number,
            opname_date: new Date(op.opname_date).toLocaleDateString('id-ID'),
            description: op.description || '-',
            status: getStatusBadge(op.status),
            total_items: op.total_items || 0
          }))}
          actions={[
            { 
              icon: Eye, 
              label: 'Lihat Detail', 
              onClick: handleView
            },
            { 
              icon: Edit, 
              label: 'Edit', 
              onClick: handleEdit,
              condition: (row) => {
                const opname = opnames.find(op => op.id === row.id);
                return opname?.status === 'draft';
              }
            }
          ]}
          customActions={(row) => {
            const opname = opnames.find(op => op.id === row.id);
            if (!opname) return null;

            return (
              <div className="flex space-x-2">
                {opname.status === 'draft' && (
                  <button
                    onClick={() => startOpname(opname.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Mulai
                  </button>
                )}
                {opname.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange(opname.id, 'completed')}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Selesaikan
                  </button>
                )}
              </div>
            );
          }}
        />
      </div>

      {/* Modal Create/Edit */}
      <Modal 
        title={editMode ? "Edit Stock Opname" : "Buat Stock Opname"} 
        isOpen={showModal} 
        onClose={resetForm}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Stock Opname
            </label>
            <input 
              name="opname_number" 
              value={form.opname_number} 
              onChange={handleChange}
              placeholder="Kosongkan untuk auto generate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
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
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
              placeholder="Deskripsi stock opname..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail */}
      <Modal
        title={`Detail Stock Opname - ${selectedOpname?.opname_number}`}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{getStatusBadge(selectedOpname?.status)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal</p>
                <p className="font-medium">{new Date(selectedOpname?.opname_date || '').toLocaleDateString('id-ID')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Deskripsi</p>
                <p className="font-medium">{selectedOpname?.description || '-'}</p>
              </div>
            </div>
          </div>

          {selectedOpname?.status === 'in_progress' && (
            <div className="bg-blue-50 p-3 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                Masukkan jumlah fisik untuk setiap produk. Sistem akan otomatis menghitung selisih.
              </p>
            </div>
          )}

          <div className="overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok Sistem
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok Fisik
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Selisih
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opnameItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500">{item.product_sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.system_count}
                      </td>
                      <td className="px-4 py-3">
                        {selectedOpname?.status === 'in_progress' ? (
                          <input
                            type="number"
                            min="0"
                            value={item.physical_count || ''}
                            onChange={(e) => handleItemCountChange(item.id, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">
                            {item.physical_count || 0}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${getVarianceColor(item.variance || 0)}`}>
                        {item.variance > 0 ? '+' : ''}{item.variance || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'match' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'variance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status === 'match' ? 'Cocok' : 
                           item.status === 'variance' ? 'Selisih' : 'Belum Dihitung'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            >
              Tutup
            </button>
            {selectedOpname?.status === 'in_progress' && (
              <button
                onClick={() => handleStatusChange(selectedOpname.id, 'completed')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Selesaikan Opname
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StockOpname;