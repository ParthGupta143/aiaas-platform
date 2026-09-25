import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "label": "#4B5563",      // form labels, section headers — was text-gray-500/400
        "value": "#111827",      // primary readable text — was default/text-gray-600
        "muted": "#6B7280",      // secondary/meta text (timestamps) — was text-gray-400
      },
    },
  },
  plugins: [],
};

export default config;