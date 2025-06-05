import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Table from '../components/Table';
import SearchBar from '../components/SearchBar';
import { Download, Filter } from 'lucide-react';

const StockMovement = () => {
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState('daily');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`/api/stock/movement?range=${filter}`)
      .then(res => res.json())
      .then(data => setMovements(data));
  }, [filter]);

  const filtered = movements.filter(m =>
    m.product.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header title="Pergerakan Stok">
        <SearchBar value={search} onChange={setSearch} />
        <select
          className="border rounded p-2"
          value={filter}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
        </select>
        <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" /> Export
        </button>
      </Header>

      <div className="px-6">
        <Table
          headers={[
            'Kategori', 'Produk', 'Stok Awal', 'Masuk', 'Pengembalian', 'Penjualan', 'Sisa'
          ]}
          data={filtered.map((m, i) => ({
            id: i,
            kategori: m.category,
            produk: m.product,
            stokAwal: m.opening,
            masuk: m.incoming,
            pengembalian: m.returns,
            penjualan: m.sales,
            sisa: m.remaining
          }))}
        />
      </div>
    </div>
  );
};

export default StockMovement;