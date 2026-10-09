'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useTheme as useNextTheme } from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider defaultTheme="system" enableSystem attribute="class" {...props}>
      {children}
    </NextThemesProvider>
  )
}

export function useTheme() {
  return useNextTheme()
}
