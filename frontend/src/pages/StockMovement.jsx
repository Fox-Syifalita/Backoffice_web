import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Table from '../components/Table';
import SearchBar from '../components/SearchBar';
import { Download, Filter } from 'lucide-react';

const StockMovement = () => {
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState('hourly');
  const [endTime, setEndTime] = useState('');
  const [search, setSearch] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [monthValue, setMonthValue] = useState('');

  useEffect(() => {
    if (filter === 'hourly' && startTime && endTime) {
      fetch(`/api/stok?start=${startTime}&end=${endTime}`)
        .then(res => res.json())
        .then(setData);
    }
  }, [filter, startTime, endTime]);


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
          <option value="hourly">Set Time</option>
          <option value="daily">Set Date</option>
          <option value="monthly">Set Month</option>
        </select>

        {filter === 'hourly' &&(
          <div className='flex gap-2 items-center'>
          <input
            type='time'
            className='border rounded p-2'
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
          />
          <span>-</span>
          <input
            type="time"
            className="border rounded p-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          </div>
        )}

        {filter === 'daily' && (
          <input
            type='date'
            className='border rounded p-2'
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
          />
          )}
          
        {filter === 'monthly' && (
          <input
            type='month'
            className='border rounded p-2'
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
          />
        )}

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