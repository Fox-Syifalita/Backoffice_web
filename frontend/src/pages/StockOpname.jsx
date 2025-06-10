import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { Plus, Trash2 } from 'lucide-react';

const StockOpname = () => {
  const [opnames, setOpnames] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    fetch(`/api/stock/opname?range=${filter}`)
      .then(res => res.json())
      .then(data => setOpnames(data));
  }, [filter]);

  const filtered = opnames.filter((op) =>
    op.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header title="Stok Opname">
        <SearchBar value={search} onChange={setSearch} />
        <button onClick={() => setShowModal(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Tambah Opname
        </button>
      </Header>

      <div className="px-6">
        <Table
          headers={["ID", "Tanggal", "Alasan", "Jumlah"]}
          data={filtered.map(op => ({
            id: op.id,
            tanggal: op.date,
            alasan: op.reason,
            jumlah: op.qty
          }))}
          actions={[
            {
              icon: Trash2,
              label: 'Hapus',
              color: 'text-red-600',
              onClick: (row) => console.log('Delete opname', row)
            }
          ]}
        />
      </div>

      <Modal title="Tambah Stok Opname" isOpen={showModal} onClose={() => setShowModal(false)}>
        {/* Form opname: reason, notes, search/add item, qty */}
      </Modal>
    </div>
  );
};

export default StockOpname;