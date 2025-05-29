// D:/my-pos-app/frontend/src/App.jsx
import React from 'react';
import POSBackOffice from './pages/POSBackOffice';

function App() {
  return (
    // Ini akan mencoba mewarnai seluruh area aplikasi dengan pink
    <div className="bg-pink-500 h-screen flex justify-center items-center text-white text-3xl">
      Hello Tailwind!
      <POSBackOffice /> {/* Tetap sertakan untuk melihat apakah ada yang ter-render */}
    </div>
  );
}

export default App;