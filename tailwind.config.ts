import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./data/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ehsBlue: "#1688C9",
        ehsLightBlue: "#A5E1F8",
        ehsMediumBlue: "#41A2D9",
        ehsDeepBlue: "#0B4F86",
        ehsNavy: "#082B49",
        ehsBlack: "#04131F",
        ehsSoftBlue: "#F3FAFE",
        borderGray: "#E5E7EB"
      }
    }
  },
  plugins: []
};

export default config;
