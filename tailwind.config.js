module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── 暗黑国风 tokens ── */
        base:      '#0B0B0E',
        card:      '#18181F',
        raised:    '#1E1E27',
        border:    '#2A2A36',
        vermilion: {
          DEFAULT: '#9E2B25',
          light:   '#B8342D',
          dark:    '#7A2020',
        },
        gold: {
          DEFAULT: '#CFAF6E',
          dim:     '#A88B4E',
          bright:  '#E0C580',
        },
        ink: {
          primary:   '#FFFFFF',
          secondary: '#B0B0B8',
          muted:     '#6B6B78',
        },
      },
      backgroundImage: {
        'chinese-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23CFAF6E' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    }
  },
  plugins: []
};
