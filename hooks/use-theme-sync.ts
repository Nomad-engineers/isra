'use client'

import { useEffect } from 'react'

/**
 * Hook to prevent hydration mismatches by synchronizing theme state
 * This should be used in the root layout to ensure SSR/client consistency
 */
export function useThemeSync() {
  useEffect(() => {
    // Ensure theme is properly applied after hydration
    const root = document.documentElement
    const storedTheme = localStorage.getItem('isra-theme') || 'dark'

    // Remove any existing theme classes
    root.classList.remove('light', 'dark')

    // Apply the stored theme or default to dark
    if (storedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(storedTheme)
    }

    // Listen for system theme changes if theme is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('isra-theme') === 'system') {
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])
}