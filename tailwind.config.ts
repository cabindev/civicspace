/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}", 
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        seppuri: ['var(--font-seppuri)'], 
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)", 
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)", 
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#2F855A",          // สีเขียวเข้ม
          "secondary": "#48BB78",        // สีเขียวกลาง
          "accent": "#68D391",           // สีเขียวอ่อน
          "neutral": "#3D4451",          // สีเทาเข้ม
          "base-100": "#FFFFFF",         // สีพื้นหลัก (ขาว)
          "info": "#4299E1",             // สีฟ้า
          "success": "#38A169",          // สีเขียว success
          "warning": "#ECC94B",          // สีเหลือง
          "error": "#E53E3E",            // สีแดง
        },
      },
    ],
  },
  darkMode: "class",
 };