import React, { useState } from "react";
import logo from '../assets/logo.jpg'; 

const Register = ({ user }) => {
    const [form, setForm] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName:''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({
                    ...form,
                    role: 'owner' 
                })

            });
        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Daftarkan Akun Baru</h2>
            {message && <p className="text-sm text-red-500 mb-3">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">First Name</label>
                    <input name="firstName" value={form.firstName} on onChange={handleChange} required className="w-full border px-3 py-2 rounded"/>
                </div>
                <div>
                    <label className="block mb-1">Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block mb-1">Username</label>
                    <input name="username" value={form.username} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                <label className="block mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                <label className="block mb-1">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
                </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Register</button>
            </form>
        </div>
    );
};

export default Register;