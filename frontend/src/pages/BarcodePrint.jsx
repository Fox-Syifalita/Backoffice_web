import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { Download } from 'lucide-react';
import JsBarcode from 'jsbarcode';

const BarcodePrint = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    filtered.forEach(p => {
      const canvas = document.getElementById(`barcode-${p.id}`);
      if (canvas && p.barcode && p.barcode.trim() !== '') {
      JsBarcode(canvas, p.barcode, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true
      });
    } else if (canvas) {
      // Kosongkan canvas atau beri tanda bahwa barcode tidak valid
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "red";
      ctx.fillText("Barcode kosong", 10, 20);
    }
  });
}, [filtered]);

  return (
    <div>
      <Header title="Cetak Barcode">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari produk..." />
      </Header>
      <div className="px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow flex flex-col items-center">
            <p className="font-semibold mb-2">{p.name}</p>
            <canvas id={`barcode-${p.id}`} />
            <button
              className="mt-2 text-sm text-blue-600 hover:underline"
              onClick={() => window.print()}
            >
              Cetak
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarcodePrint;
