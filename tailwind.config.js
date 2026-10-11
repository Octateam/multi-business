/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'Inter', 'sans-serif'],
      },
      colors: {
        // Sidebar / navy shell
        'sidebar-bg': '#000b11',
        'sidebar-border': 'rgba(255,255,255,0.1)',
        'sidebar-card-bg': '#003e62',
        'sidebar-card-border': '#001e2b',
        // Surfaces
        surface: '#ffffff',
        'surface-2': '#f5f6f8',
        'surface-3': '#e1e4e9',
        'bg-inverted': '#111927',
        // Text
        'text-primary': '#111927',
        'text-quaternary': '#6c737f',
        'text-white': '#ffffff',
        // Borders
        'border-disabled': '#e1e4e9',
        // Brand
        brand: '#00a9e0',
        // Status
        'status-approved-bg': '#e1fff7',
        'status-approved-text': '#077155',
        'status-rejected-bg': '#ffecef',
        'status-rejected-text': '#aa253d',
        'status-pending-bg': '#fef9c3',
        'status-pending-text': '#713f12',
        'status-info-bg': '#e0f2fe',
        'status-info-text': '#075985',
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
}
