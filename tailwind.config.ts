import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./data/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ehsBlue: "#41A2D9",
        ehsLightBlue: "#A5E1F8",
        ehsMediumBlue: "#63C4EC",
        ehsBlack: "#050505",
        ehsSoftBlue: "#F3FAFE",
        borderGray: "#E5E7EB"
      }
    }
  },
  plugins: []
};

export default config;
