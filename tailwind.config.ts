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
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          inverse: "var(--primary-inverse)",
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
        gold: {
          DEFAULT: "#FFD700", // Keep gold static
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: {
          DEFAULT: "var(--border)",
          hover: "var(--border-hover)",
          focus: "var(--border-focus)",
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
