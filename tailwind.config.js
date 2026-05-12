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
        // 国潮主色 - 中国红系
        'china-red': {
          DEFAULT: '#C41E3A',
          50: '#FCE8EB',
          100: '#F8D1D7',
          200: '#F0A3AF',
          300: '#E87587',
          400: '#E0475F',
          500: '#C41E3A',
          600: '#9D182E',
          700: '#761223',
          800: '#4F0C17',
          900: '#28060C',
        },
        // 帝王金系
        'imperial-gold': {
          DEFAULT: '#D4AF37',
          50: '#FBF7E6',
          100: '#F7EFCC',
          200: '#EFDF99',
          300: '#E7CF66',
          400: '#DFBF33',
          500: '#D4AF37',
          600: '#AA8C2C',
          700: '#806921',
          800: '#554616',
          900: '#2B230B',
        },
        // 墨色系
        'ink-black': {
          DEFAULT: '#0A0A0A',
          50: '#737373',
          100: '#595959',
          200: '#404040',
          300: '#262626',
          400: '#1A1A1A',
          500: '#0F0F0F',
          600: '#0A0A0A',
          700: '#080808',
          800: '#050505',
          900: '#030303',
        },
        // 宣纸色
        'rice-paper': '#F5F0E8',
        // 传统色
        'cinnabar': '#E34234',
        'vermilion': '#C73E3A',
        'gold-leaf': '#C9A050',
      },
      fontFamily: {
        'display': ['Playfair Display', 'Noto Serif SC', 'serif'],
        'body': ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'china-red-gradient': 'linear-gradient(135deg, #C41E3A 0%, #8B0000 50%, #4A0000 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)',
        'luxury-dark': 'linear-gradient(180deg, #0A0A0A 0%, #1A0A0A 50%, #0A0A0A 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #D4AF37, 0 0 10px #D4AF37' },
          '100%': { boxShadow: '0 0 20px #D4AF37, 0 0 30px #D4AF37' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
        'red-glow': '0 0 20px rgba(196, 30, 58, 0.4)',
      },
    },
  },
  plugins: [],
}