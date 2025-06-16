import React from 'react';

const Header = ({ title, children, toggleSidebar,isSidebarOpen }) => (
  <div className="bg-white shadow-sm border-b px-6 py-4 mb-6">
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex space-x-2">{children}</div>
    </div>
  </div>
);

export default Header;
