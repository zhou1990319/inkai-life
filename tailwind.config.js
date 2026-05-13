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
        // ============================================
        // 新中式暗黑国风配色系统 - 未来东方美学
        // ============================================
        
        // 玄黑系 - 主背景色
        'xuan-black': {
          DEFAULT: '#0A0A0D',
          50: '#1A1A20',
          100: '#2A2A30',
          200: '#3A3A40',
          300: '#4A4A50',
        },
        
        // 朱砂红系 - 主强调色（低饱和暗红）
        'zhusha-red': {
          DEFAULT: '#A62323',
          light: '#C63333',
          dark: '#861818',
          50: '#3D1515',
          100: '#5A1A1A',
        },
        
        // 鎏金系 - 哑光金属金
        'liujin-gold': {
          DEFAULT: '#D4AF37',
          light: '#E4BF47',
          dark: '#B49F27',
          50: '#3D3515',
          100: '#5A4F1A',
        },
        
        // 冷青蓝 - 科技光效
        'cyber-cyan': {
          DEFAULT: '#2A4D69',
          light: '#3A5D79',
          dark: '#1A3D59',
        },
        
        // 墨灰色系 - 中性色
        'ink-gray': {
          50: '#4A5568',
          100: '#2D3748',
          200: '#1A202C',
          300: '#0F1419',
        },
        
        // 宣纸色 - 文字色
        'rice-paper': '#F5F0E8',
        
        // 传统色（保留兼容）
        'china-red': {
          DEFAULT: '#A62323',
          50: '#FCE8EB',
          100: '#F8D1D7',
          200: '#F0A3AF',
          300: '#E87587',
          400: '#E0475F',
          500: '#A62323',
          600: '#861818',
          700: '#661212',
          800: '#460C0C',
          900: '#260606',
        },
        
        // 帝王金系（保留兼容）
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
        
        // 墨色系（保留兼容）
        'ink-black': {
          DEFAULT: '#0A0A0D',
          50: '#737373',
          100: '#595959',
          200: '#404040',
          300: '#262626',
          400: '#1A1A20',
          500: '#0F0F12',
          600: '#0A0A0D',
          700: '#08080B',
          800: '#050507',
          900: '#030304',
        },
        
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
        
        // 新中式渐变
        'xuan-gradient': 'linear-gradient(180deg, #0A0A0D 0%, #1A1A20 50%, #0A0A0D 100%)',
        'zhusha-gradient': 'linear-gradient(135deg, #A62323 0%, #861818 50%, #661212 100%)',
        'liujin-gradient': 'linear-gradient(90deg, #B49F27 0%, #D4AF37 50%, #E4BF47 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #2A4D69 0%, #1A3D59 100%)',
        
        // 水墨渐变背景
        'ink-wash': 'radial-gradient(ellipse at 50% 0%, rgba(42, 77, 105, 0.15) 0%, transparent 50%), linear-gradient(180deg, #0A0A0D 0%, #1A1A20 100%)',
        
        // 保留兼容
        'china-red-gradient': 'linear-gradient(135deg, #A62323 0%, #861818 50%, #661212 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #B49F27 0%, #D4AF37 50%, #E4BF47 100%)',
        'luxury-dark': 'linear-gradient(180deg, #0A0A0D 0%, #1A1A20 50%, #0A0A0D 100%)',
      },
      
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'ink-spread': 'ink-spread 1s ease-out forwards',
      },
      
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.3), 0 0 10px rgba(212, 175, 55, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ink-spread': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      boxShadow: {
        // 鎏金光效
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
        'gold-glow-sm': '0 0 10px rgba(212, 175, 55, 0.2)',
        
        // 朱砂红光效
        'red-glow': '0 0 20px rgba(166, 35, 35, 0.4)',
        'red-glow-lg': '0 0 40px rgba(166, 35, 35, 0.5)',
        'red-glow-sm': '0 0 10px rgba(166, 35, 35, 0.3)',
        
        // 冷青蓝科技光效
        'cyan-glow': '0 0 15px rgba(42, 77, 105, 0.5)',
        'cyan-glow-lg': '0 0 30px rgba(42, 77, 105, 0.6)',
        
        // 毛玻璃卡片阴影
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5)',
        
        // 保留兼容
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
      },
      
      // 毛玻璃效果
      backdropBlur: {
        'xs': '2px',
        'glass': '20px',
      },
      
      // 边框圆角
      borderRadius: {
        '4xl': '2rem',
      },
      
      // 间距
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
