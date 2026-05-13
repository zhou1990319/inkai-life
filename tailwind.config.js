/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 极简黑白灰配色系统
        'pure-black': '#000000',
        'pure-white': '#FFFFFF',
        'dark-gray': '#333333',
        'mid-gray': '#666666',
        'light-gray': '#999999',
        'border-gray': '#E5E5E5',
        'bg-gray': '#F5F5F5',
        'accent-gold': '#D4AF37',
        
        // 保留兼容（用于不破坏其他页面）
        'xuan-black': {
          DEFAULT: '#000000',
          50: '#1A1A1A',
          100: '#2A2A2A',
        },
        'liujin-gold': {
          DEFAULT: '#D4AF37',
          light: '#E4C04A',
          dark: '#C4A030',
        },
        'rice-paper': '#FFFFFF',
        'zhusha-red': {
          DEFAULT: '#333333',
          light: '#444444',
          dark: '#222222',
        },
      },
      
      fontFamily: {
        'display': ['Inter', 'Noto Sans SC', 'sans-serif'],
        'body': ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
      
      spacing: {
        '18': '4.5rem',
        '30': '7.5rem',
        '40': '10rem',
      },
      
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
}
