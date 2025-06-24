import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Table from '../components/Table';
import SearchBar from '../components/SearchBar';
import { Download, Filter, Calendar, Clock } from 'lucide-react';

const StockMovement = () => {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('daily');
  const [search, setSearch] = useState('');

  // Time range states
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0]);
  const [weekValue, setWeekValue] = useState('');
  const [monthValue, setMonthValue] = useState(new Date().toISOString().slice(0, 7));

  // Error state
  const [error, setError] = useState('');

  const fetchStockMovements = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = '/api/stockmovement';
      const params = new URLSearchParams();

      // Add filters based on selected period
      switch (filter) {
        case 'hourly':
          if (startTime && endTime) {
            params.append('start', startTime);
            params.append('end', endTime);
          }
          break;
        case 'daily':
          if (dateValue) {
            params.append('date', dateValue);
          }
          break;
        case 'weekly':
          if (weekValue) {
            const [year, week] = weekValue.split('-W');
            const startDate = getDateFromWeek(parseInt(year), parseInt(week));
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            params.append('start_date', startDate.toISOString().split('T')[0]);
            params.append('end_date', endDate.toISOString().split('T')[0]);
          }
          break;
        case 'monthly':
          if (monthValue) {
            params.append('month', monthValue);
          }
          break;
      }

      const response = await fetch(`${url}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data stock movement');
      }
      
      const data = await response.json();
      
      // Process and group data by product
      const processedData = processStockMovementData(data);
      setMovements(processedData);
      setFilteredMovements(processedData);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process raw stock movement data into grouped format
  const processStockMovementData = (rawData) => {
    const groupedData = {};
    
    rawData.forEach(movement => {
      const key = `${movement.product_id}-${movement.product_name}`;
      
      if (!groupedData[key]) {
        groupedData[key] = {
          product_id: movement.product_id,
          product_name: movement.product_name,
          category: movement.category || 'Tidak Dikategorikan',
          opening_stock: 0,
          incoming: 0,
          returns: 0,
          sales: 0,
          outgoing: 0,
          remaining: 0
        };
      }
      
      const item = groupedData[key];
      
      // Categorize movements based on movement_type
      switch (movement.movement_type) {
        case 'IN':
        case 'PURCHASE':
          item.incoming += parseInt(movement.quantity) || 0;
          break;
        case 'OUT':
        case 'SALE':
          item.sales += parseInt(movement.quantity) || 0;
          break;
        case 'RETURN_IN':
          item.returns += parseInt(movement.quantity) || 0;
          break;
        case 'RETURN_OUT':
        case 'ADJUSTMENT':
          item.outgoing += parseInt(movement.quantity) || 0;
          break;
        case 'OPENING':
          item.opening_stock = parseInt(movement.quantity) || 0;
          break;
      }
    });
    
    // Calculate remaining stock for each product
    Object.values(groupedData).forEach(item => {
      item.remaining = item.opening_stock + item.incoming + item.returns - item.sales - item.outgoing;
    });
    
    return Object.values(groupedData);
  };

  // Helper function to get date from week number
  const getDateFromWeek = (year, week) => {
    const date = new Date(year, 0, 1);
    const dayOfWeek = date.getDay();
    const dayOffset = dayOfWeek <= 4 ? dayOfWeek - 1 : dayOfWeek - 8;
    date.setDate(date.getDate() - dayOffset + (week - 1) * 7);
    return date;
  };

  // Filter data based on search term
  useEffect(() => {
    if (!search) {
      setFilteredMovements(movements);
    } else {
      const filtered = movements.filter(item =>
        item.product_name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredMovements(filtered);
    }
  }, [search, movements]);

  // Fetch data when filter values change
  useEffect(() => {
    fetchStockMovements();
  }, [filter, startTime, endTime, dateValue, weekValue, monthValue]);

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Kategori', 'Produk', 'Stok Awal', 'Masuk', 'Pengembalian', 'Penjualan', 'Keluar', 'Sisa'];
    const csvContent = [
      headers.join(','),
      ...filteredMovements.map(item => [
        item.category,
        item.product_name,
        item.opening_stock,
        item.incoming,
        item.returns,
        item.sales,
        item.outgoing,
        item.remaining
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-movement-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get current week in YYYY-Www format
  const getCurrentWeek = () => {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const week = Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Pergerakan Stok">
        <div className="flex gap-4 items-center flex-wrap">
          <SearchBar 
            value={search} 
            onChange={setSearch}
            placeholder="Cari produk atau kategori..."
          />
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="hourly">Rentang Jam</option>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>

          {/* Hourly Filter */}
          {filter === 'hourly' && (
            <div className="flex gap-2 items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <input
                type="time"
                className="border-0 focus:outline-none"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <span className="text-gray-500">-</span>
              <input
                type="time"
                className="border-0 focus:outline-none"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          )}

          {/* Daily Filter */}
          {filter === 'daily' && (
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                className="border-0 focus:outline-none"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
            </div>
          )}

          {/* Weekly Filter */}
          {filter === 'weekly' && (
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="week"
                className="border-0 focus:outline-none"
                value={weekValue || getCurrentWeek()}
                onChange={(e) => setWeekValue(e.target.value)}
              />
            </div>
          )}

          {/* Monthly Filter */}
          {filter === 'monthly' && (
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="month"
                className="border-0 focus:outline-none"
                value={monthValue}
                onChange={(e) => setMonthValue(e.target.value)}
              />
            </div>
          )}

          <button 
            onClick={exportToCSV}
            disabled={filteredMovements.length === 0}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> 
            Export CSV
          </button>
        </div>
      </Header>

      <div className="px-6 py-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Menampilkan {filteredMovements.length} produk
            </div>
            
            <Table
              headers={[
                'Kategori', 
                'Produk', 
                'Stok Awal', 
                'Masuk', 
                'Pengembalian', 
                'Penjualan', 
                'Keluar', 
                'Sisa'
              ]}
              data={filteredMovements.map((item, index) => ({
                id: index,
                kategori: item.category,
                produk: item.product_name,
                stokAwal: item.opening_stock.toLocaleString('id-ID'),
                masuk: item.incoming.toLocaleString('id-ID'),
                pengembalian: item.returns.toLocaleString('id-ID'),
                penjualan: item.sales.toLocaleString('id-ID'),
                keluar: item.outgoing.toLocaleString('id-ID'),
                sisa: (
                  <span className={`font-semibold ${
                    item.remaining < 0 
                      ? 'text-red-600' 
                      : item.remaining < 10 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                  }`}>
                    {item.remaining.toLocaleString('id-ID')}
                  </span>
                )
              }))}
            />

            {filteredMovements.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg mb-2">Tidak ada data</div>
                <div className="text-sm">Tidak ada pergerakan stok untuk periode yang dipilih</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StockMovement;