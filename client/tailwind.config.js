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
                mint: {
                    DEFAULT: '#34D399',
                    500: '#10B981', // Emerald-500 equivalent for darker shade
                    600: '#059669',
                },
                dark: {
                    bg: '#111827', // gray-900
                    card: '#1F2937', // gray-800
                }
            },
        },
    },
    plugins: [],
}
