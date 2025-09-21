import { createContext } from 'react'

interface ThemeContextType {
	theme: string
	setTheme: (theme: string) => void
	toggleTheme: () => void
	isDark: boolean
}

export const ThemeContext: React.Context<ThemeContextType> = createContext({})
