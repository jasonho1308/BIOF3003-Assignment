import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';

const DarkModeToggle: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <button
            onClick={toggleDarkMode}
            className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 shadow-lg transition-all duration-300"
        >
            {isDarkMode ? '☀️' : '🌙'}
        </button>
    );
};

export default DarkModeToggle;
