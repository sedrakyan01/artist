import { useEffect, useState } from 'react'

import { ThemeContext } from '../../context/Theme/ThemeContext'

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState(() => {
		const savedTheme = localStorage.getItem('theme')
		return savedTheme || 'dark'
	})

	useEffect(() => {
		localStorage.setItem('theme', theme)

		if (theme === 'dark') {
			document.documentElement.classList.add('dark')
			document.documentElement.style.backgroundColor = '#18161c'
		} else {
			document.documentElement.classList.remove('dark')
			document.documentElement.style.backgroundColor = '#fff'
		}
	}, [theme])

	const toggleTheme = () => {
		setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
	}

	const value = {
		theme,
		setTheme,
		toggleTheme,
		isDark: theme === 'dark',
	}

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
