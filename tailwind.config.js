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
  },
  plugins: [],
}
