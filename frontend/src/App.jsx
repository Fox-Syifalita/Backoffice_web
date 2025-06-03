import React, {useState, useEffect} from 'react';
import Login from './pages/Login.jsx';
import POSBackOffice from './pages/POSBackOffice';

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem
  })
  return (
    <div className="min-h-screen">
      <POSBackOffice />
    </div>
  );
}

export default App;
