import React, { useState } from "react";

const Login = ({onLogin}) => {
    const [form, setForm] = useState({ username: '', password: ''});
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login gagal');
            localStorage.setItem('token', data.token);
            onLogin(data.user);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-1 text-sm">Username</label>
          <input name="username" value={form.username} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-sm">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        <p className="text-sm mt-4">
          Belum punya akun? <a href="/register" className="text-blue-600 underline">Daftar di sini</a>
        </p>
      </form>
    </div>
  );
}

export default Login;

