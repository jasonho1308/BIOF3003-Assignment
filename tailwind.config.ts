import type { Config } from "tailwindcss";

export default {
  darkMode: 'class', // Enable dark mode with the 'class' strategy
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#06b6d4", // Cyan
        secondary: "#10b981", // Green
        danger: "#ef4444", // Red
        neutral: "#f3f4f6", // Light Gray
        darkBackground: "#1a202c", // Dark mode background
        darkForeground: "#2d3748", // Dark mode foreground
        darkPrimary: "#0ea5e9", // Dark mode primary
        darkSecondary: "#059669", // Dark mode secondary
        darkDanger: "#dc2626", // Dark mode danger
      },
      spacing: {
        18: "4.5rem", // Custom spacing
        22: "5.5rem",
      },
      boxShadow: {
        card: "0 4px 6px rgba(0, 0, 0, 0.1)", // Custom shadow for cards
        button: "0 2px 4px rgba(0, 0, 0, 0.1)", // Custom shadow for buttons
      },
      borderRadius: {
        xl: "1rem", // Extra large rounded corners
      },
    },
  },
  plugins: [],
} satisfies Config;
