import React from "react";
import { LogOut } from "lucide-react";

const LogoutButton = ({ onLogout, isSidebarOpen }) => {
  return (
    <button
      onClick={onLogout}
      className="flex items-center w-full text-left text-red-400 hover:text-red-300"
    >
      <LogOut size={20} />
      {isSidebarOpen && <span className="ml-4 whitespace-nowrap">Logout</span>}
    </button>
  );
};

export default LogoutButton;