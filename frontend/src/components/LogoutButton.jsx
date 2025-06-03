import React from "react";

const LogoutButton = ({ onLogout }) => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        onLogout();
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center text-red-600 px-4 py-2 hover:bg-red-100 rounded"
        >
            Logout
        </button>
    );
};

export default LogoutButton;