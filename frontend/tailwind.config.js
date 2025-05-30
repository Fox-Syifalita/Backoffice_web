/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',     // Biru utama
        secondary: '#64748B',   // Abu soft
        success: '#10B981',     // Hijau untuk status sukses
        danger: '#EF4444',      // Merah untuk status out
        warning: '#F59E0B',     // Kuning (opsional)
        neutral: '#F3F4F6',     // Abu background
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'md': '1.075rem',
        'lg': '1.25rem',
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.05)',
        focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
