/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'web3-dark': '#1a1a2e',
        'web3-darker': '#16213e',
        'web3-accent': '#6b46c1', // Purple like Uniswap
        'web3-highlight': '#38bdf8', // Blue like Aave
        'web3-neon': '#10b981', // Green for highlights
        'web3-orange': '#f59e0b', // Orange for urgent items
        'web3-red': '#ef4444', // Red for critical items
        'web3-gray': '#374151',
        'web3-gray-light': '#4b5563'
      },
      animation: {
        'pulse-web3': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #6b46c1' },
          '50%': { boxShadow: '0 0 15px #38bdf8' },
          '100%': { boxShadow: '0 0 5px #6b46c1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'orbitron': ['Orbitron', 'monospace']
      },
      backgroundImage: {
        'gradient-web3': 'linear-gradient(135deg, #6b46c1 0%, #38bdf8 50%, #10b981 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      }
    },
  },
  plugins: [],
}
