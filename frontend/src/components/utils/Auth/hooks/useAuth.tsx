import { useContext } from 'react'
import type { AuthContextType } from '../type'
import { AuthContext } from '../../../context/Auth/AuthContext'

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth должен использоваться с провайдером')
	}
	return context
}
