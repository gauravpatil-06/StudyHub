/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#47C4B7",
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'Poppins', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
