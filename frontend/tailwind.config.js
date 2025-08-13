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
        'web3-gray-light': '#4b5563',
        'web3-purple': '#8b5cf6',
        'web3-cyan': '#06b6d4',
        'web3-emerald': '#059669'
      },
      animation: {
        'pulse-web3': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 15s ease infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 3s linear infinite'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #6b46c1' },
          '50%': { boxShadow: '0 0 20px #38bdf8, 0 0 30px #6b46c1' },
          '100%': { boxShadow: '0 0 5px #6b46c1' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'orbitron': ['Orbitron', 'monospace']
      },
      backgroundImage: {
        'gradient-web3': 'linear-gradient(135deg, #6b46c1 0%, #38bdf8 50%, #10b981 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, #6b46c1 0%, transparent 70%)',
        'gradient-mesh': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #1e3a8a 75%, #1e40af 100%)'
      },
      boxShadow: {
        'web3-glow': '0 0 20px rgba(107, 70, 193, 0.3)',
        'web3-glow-lg': '0 0 30px rgba(56, 189, 248, 0.4)',
        'web3-glow-xl': '0 0 40px rgba(16, 185, 129, 0.5)',
        'web3-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
      },
      backdropBlur: {
        'xs': '2px',
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
        '110': '1.10'
      }
    },
  },
  plugins: [],
}
