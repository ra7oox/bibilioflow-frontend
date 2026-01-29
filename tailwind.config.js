/** @type {import('tailwindcss').Config} */
module.exports = {
  // ====================================================================
  // ACTIVATION DU MODE SOMBRE
  // ====================================================================
  darkMode: 'class', // Active le mode sombre via la classe 'dark'
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Vous pouvez personnaliser les couleurs du mode sombre ici
      colors: {
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
        }
      }
    },
  },
  plugins: [],
}