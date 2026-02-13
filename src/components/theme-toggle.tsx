'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        console.log('ThemeToggle mounted. Current theme:', theme, 'Resolved:', resolvedTheme);
    }, [theme, resolvedTheme]);

    if (!mounted) {
        return <div className="p-3 w-12 h-12" />; // Avoid hydration mismatch
    }

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        console.log('Toggling theme to:', nextTheme);
        setTheme(nextTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-neutral-500 hover:text-black dark:hover:text-white"
            aria-label="Toggle theme"
        >
            {resolvedTheme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
    );
}
