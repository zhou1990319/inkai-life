module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316',  // orange-500
          light: '#fb923c',    // orange-400
          dark: '#ea580c',     // orange-600
        },
        accent: {
          DEFAULT: '#fbbf24',  // amber-400
          light: '#fcd34d',   // amber-300
          dark: '#f59e0b',    // amber-500
        },
      }
    }
  },
  plugins: []
};
