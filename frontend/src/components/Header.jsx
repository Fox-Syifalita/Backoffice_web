import React from 'react';

const Header = ({ title, children }) => (
  <div className="bg-white shadow-sm border-b px-6 py-4 mb-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      <div className="flex space-x-2">{children}</div>
    </div>
  </div>
);

export default Header;