import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const SalesChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold mb-4">Sales Summary</h3>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => `Rp${value.toLocaleString('id-ID')}`} />
        <Bar dataKey="total" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default SalesChart;
