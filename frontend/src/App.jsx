import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import POSBackOffice from './pages/POSBackOffice';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return user
    ? <POSBackOffice user={user} onLogout={() => setUser(null)} />
    : <Login onLogin={(user) => setUser(user)} />;
}

export default App;
