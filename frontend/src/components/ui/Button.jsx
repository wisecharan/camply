import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    // Base styles for the premium aesthetic: pill-shaped, centered content, bouncy active state
    const baseStyle = "inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
        primary: "bg-gray-900 text-white hover:bg-black shadow-md hover:shadow-lg focus:ring-gray-900 border border-transparent",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-200 border border-transparent",
        outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm focus:ring-gray-200",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500 border border-transparent",
        'danger-outline': "border border-red-200 bg-white text-red-600 hover:bg-red-50 shadow-sm focus:ring-red-200",
        ghost: "text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-transparent border border-transparent"
    };

    return (
        <button 
            className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`} 
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;