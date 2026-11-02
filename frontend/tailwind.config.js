/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { ink: '#0b1020', panel: '#111a2d', line: '#24324a', accent: '#8b9cff' }, boxShadow: { glow: '0 18px 60px rgba(86,104,255,.14)' } } },
  plugins: [],
};
