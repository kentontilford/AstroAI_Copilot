/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette based on brand style guide
        'dark-space': '#12121F',       // Dark background
        'nebula-veil': '#352A4C',      // Card backgrounds
        'supernova-teal': '#00C9B1',   // Primary accent
        'stardust-silver': '#D1D1D6',  // Secondary accent
        'starlight-white': '#F0F0F0',  // Text color
        'cosmic-purple': '#6E3AC7',    // Tertiary accent
        'error-red': '#E53E3E',        // Error messages
        'success-green': '#38A169',    // Success messages
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cosmic': 'linear-gradient(to right, #352A4C, #12121F)',
      },
    },
  },
  plugins: [],
};