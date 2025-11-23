'use client'

/**
 * ThemeSyncScript - Prevents hydration mismatches by synchronizing theme before React loads
 * This script runs immediately on the client to apply the correct theme class to the HTML element
 */
export function ThemeSyncScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Get stored theme from localStorage, default to 'dark'
              var theme = localStorage.getItem('isra-theme') || 'dark';
              var root = document.documentElement;

              // Remove any existing theme classes
              root.classList.remove('light', 'dark');

              // Apply the correct theme
              if (theme === 'system') {
                var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
              } else {
                root.classList.add(theme);
              }
            } catch (e) {
              // If anything fails, default to dark mode
              document.documentElement.classList.add('dark');
            }
          })();
        `,
      }}
    />
  )
}