import { useEffect, useState } from 'react'

export const useAuthToken = () => {
	const [token, setToken] = useState<string | null>(
		localStorage.getItem('accessToken')
	)

	const refreshToken = () => {
		setToken(localStorage.getItem('accessToken'))
	}

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'accessToken') {
				setToken(e.newValue)
			}
		}

		const handleCustomTokenUpdate = () => {
			refreshToken()
		}

		window.addEventListener('storage', handleStorageChange)
		window.addEventListener('tokenUpdated', handleCustomTokenUpdate)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			window.removeEventListener('tokenUpdated', handleCustomTokenUpdate)
		}
	}, [])

	return { token, setToken, refreshToken }
}
