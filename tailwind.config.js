/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
          'blue': {
            600: '#2563eb',
            700: '#1d4ed8',
            900: '#1e3a8a',
          },
          'black': '#000000',
          'gray': {
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
        },
        fontFamily: {
          'mono': ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
          'sans': ['Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
