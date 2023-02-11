/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/views/*.html", "./public/views/*.hbs"],
  theme: {
    extend: {
      colors: {
        'custom_black': "#0F172A",
        'custom_white': "#f8fafc",
        'custom_border' : "#2A364A",
        "hover_color":"#1e293b"
      }
    },
    screens: {
      'laptop': { 'max': '1024px' },
      // => @media (min-width: 1024px) { ... }

      'tablet': { 'max': '768px' },
      // => @media (min-width: 768px) { ... }

      'mobile': { 'max': '640px'},
      // => @media (min-width: 640px) { ... }

      'xl': { 'max': '1280px' },
      // => @media (min-width: 1280px) { ... }

      '2xl': { 'max': '1536px' },
      // => @media (min-width: 1536px) { ... }
    }
  },
  plugins: [],
}
