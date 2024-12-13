import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                dark: '#0D0E10',
                'light-gray': '#616161'
            },
            boxShadow: {
                'custom': '0px 4px 4px 0px #0000000D',
            },
            backgroundImage: {
                'custom': "url('/images/bg.png')",
            }
        },
    },

    plugins: [forms],
};
