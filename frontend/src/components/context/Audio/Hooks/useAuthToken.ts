import { useEffect, useState } from 'react'

export const useAuthToken = () => {
	const [token, setToken] = useState<string | null>(
		localStorage.getItem('accessToken')
	)

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'accessToken') {
				setToken(e.newValue)
			}
		}
		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [])

	return { token, setToken }
}
