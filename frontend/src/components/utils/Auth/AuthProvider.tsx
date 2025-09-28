import React, { useCallback, useEffect, useState } from 'react'
import { AuthContext } from '../../context/Auth/AuthContext'
import type { AuthContextType, AuthProviderProps } from './type'

const getTokenFromStorage = (): string | null => {
	try {
		return localStorage.getItem('accessToken')
	} catch {
		return null
	}
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(true)
	const [loading, setLoading] = useState<boolean>(true)

	const validateToken = useCallback(async () => {
		const token = getTokenFromStorage()
		if (!token) {
			setIsUserAuthenticated(false)
			setLoading(false)
			return
		}

		try {
			const res = await fetch('http://localhost:8080/getuserdatasend', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
				body: JSON.stringify(['artistName', 'firstName', 'username', 'plays']),
			})

			if (res.ok) {
				setIsUserAuthenticated(true)
			} else if (res.status === 401 || res.status === 403) {
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				setIsUserAuthenticated(false)
			} else {
				console.error(`Ошибка проверки токена: ${res.status}`)
				setIsUserAuthenticated(false)
			}
		} catch (error) {
			console.error('Ошибка проверки токена:', error)
			setIsUserAuthenticated(false)
		} finally {
			setLoading(false)
		}
	}, [])

	const refreshAuth = useCallback((): void => {
		validateToken()
	}, [validateToken])

	const login = useCallback(
		(accessToken: string, refreshToken?: string): void => {
			try {
				localStorage.setItem('accessToken', accessToken)
				if (refreshToken) {
					localStorage.setItem('refreshToken', refreshToken)
				}

				window.dispatchEvent(new Event('tokenUpdated'))

				setIsUserAuthenticated(true)
			} catch (error) {
				console.error('Error saving tokens:', error)
			}
		},
		[]
	)

	useEffect(() => {
		validateToken()

		const handleStorageChange = (event: StorageEvent): void => {
			if (event.key === 'accessToken') {
				validateToken()
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => {
			window.removeEventListener('storage', handleStorageChange)
		}
	}, [validateToken])

	const contextValue: AuthContextType = {
		isUserAuthenticated,
		login,
		refreshAuth,
		setIsUserAuthenticated,
		validateToken,
		loading,
	}

	if (loading) {
		return (
			<div>
				<div className='flex items-center justify-center h-screen'>
					<div className='animate-spin rounded-full h-32 w-32 border-t-2 border-purple-500 border-b-2 border-l-2'></div>
				</div>
			</div>
		)
	}

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	)
}
