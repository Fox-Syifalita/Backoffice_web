import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Eye, Edit, Trash2, Shield, User } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('owner'); // This should come from auth context
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'cashier',
    is_active: true
  });

  // Check if current user has permission to edit/delete
  const hasEditPermission = currentUserRole === 'owner' || currentUserRole === 'supervisor';

  useEffect(() => {
    fetchEmployees();
    // In real app, get current user role from auth context
    // setCurrentUserRole(authContext.user.role);
  }, []);

  const fetchEmployees = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error('Error fetching employees:', err));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setForm({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'cashier',
      is_active: true
    });
    setEditingEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        is_active: form.is_active
      };

      // Only include password for new employees or when it's being changed
      if (!editingEmployee || form.password) {
        payload.password = form.password;
      }

      const url = editingEmployee ? `/api/users/${editingEmployee.id}` : '/api/users';
      const method = editingEmployee ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to save employee');
      }

      const savedEmployee = await res.json();

      if (editingEmployee) {
        setEmployees(prev => prev.map(emp => 
          emp.id === editingEmployee.id ? savedEmployee : emp
        ));
      } else {
        setEmployees(prev => [...prev, savedEmployee]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error saving employee. Please try again.');
    }
  };

  const handleEdit = (employee) => {
    if (!hasEditPermission) {
      alert('You do not have permission to edit employees.');
      return;
    }

    setEditingEmployee(employee);
    setForm({
      username: employee.username,
      email: employee.email,
      password: '', // Don't prefill password for security
      first_name: employee.first_name,
      last_name: employee.last_name,
      role: employee.role,
      is_active: employee.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (employee) => {
    if (!hasEditPermission) {
      alert('You do not have permission to delete employees.');
      return;
    }

    if (!confirm(`Are you sure you want to delete employee "${employee.first_name} ${employee.last_name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${employee.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete employee');
      }

      setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee. Please try again.');
    }
  };

  const handleView = (employee) => {
    alert(`Employee Details:\nName: ${employee.first_name} ${employee.last_name}\nUsername: ${employee.username}\nEmail: ${employee.email}\nRole: ${employee.role}\nStatus: ${employee.is_active ? 'Active' : 'Inactive'}`);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'supervisor':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'admin':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filtered = employees.filter(emp =>
    emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define actions based on user permissions
  const getTableActions = () => {
    const actions = [
      { icon: Eye, label: 'View', onClick: handleView }
    ];

    if (hasEditPermission) {
      actions.push(
        { icon: Edit, label: 'Edit', onClick: handleEdit },
        { icon: Trash2, label: 'Delete', onClick: handleDelete, color: 'text-red-600' }
      );
    }

    return actions;
  };

  return (
    <div>
      <Header title="Employee Management">
        <SearchBar 
          placeholder="Search employees..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        {hasEditPermission && (
          <button 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Employee
          </button>
        )}
      </Header>

      <div className="px-6">
        <Table
          headers={['Name', 'Username', 'Email', 'Role', 'Status']}
          data={filtered.map(emp => ({
            id: emp.id,
            name: (
              <div className="flex items-center space-x-2">
                <span>{emp.first_name} {emp.last_name}</span>
              </div>
            ),
            username: emp.username,
            email: emp.email,
            role: (
              <div className="flex items-center space-x-2">
                {getRoleIcon(emp.role)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(emp.role)}`}>
                  {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}
                </span>
              </div>
            ),
            status: (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                emp.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {emp.is_active ? 'Active' : 'Inactive'}
              </span>
            ),
            _raw: emp // Pass raw data for actions
          }))}
          actions={getTableActions()}
        />
      </div>

      <Modal 
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'} 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input 
                name="first_name" 
                value={form.first_name} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input 
                name="last_name" 
                value={form.last_name} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input 
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input 
              type="email"
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {editingEmployee ? '(leave blank to keep current)' : '*'}
            </label>
            <input 
              type="password"
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              required={!editingEmployee}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select 
              name="role" 
              value={form.role} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
              {currentUserRole === 'owner' && (
                <>
                  <option value="supervisor">Supervisor</option>
                  <option value="owner">Owner</option>
                </>
              )}
            </select>
          </div>

          <div className="flex items-center">
            <input 
              type="checkbox"
              id="is_active"
              name="is_active" 
              checked={form.is_active} 
              onChange={handleChange} 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active Employee
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {editingEmployee ? 'Update' : 'Create'} Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;