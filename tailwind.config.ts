import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: {
          DEFAULT: "#0A0A0A",
          hover: "#111111",
          active: "#1A1A1A",
        },
        primary: {
          DEFAULT: "#FFFFFF",
          inverse: "#000000",
        },
        success: {
          DEFAULT: "#34C759", // Apple green
        },
        danger: {
          DEFAULT: "#FF3B30", // Apple red
        },
        warning: {
          DEFAULT: "#FF9F0A", // Apple orange
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#888888",
          muted: "#555555",
        },
        border: {
          DEFAULT: "#1A1A1A",
          hover: "#2A2A2A",
          focus: "#4A4A4A",
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        card: "12px",
        "card-lg": "24px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scan-line 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
      keyframes: {
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      },
      boxShadow: {
        'inner-border': 'inset 0 0 0 1px #1A1A1A',
        'inner-border-hover': 'inset 0 0 0 1px #2A2A2A',
        'glow': '0 0 20px rgba(255,255,255,0.05)',
      }
    },
  },
  plugins: [],
};

module.exports = config;
