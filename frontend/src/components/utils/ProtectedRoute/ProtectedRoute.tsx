import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../Auth/hooks/useAuth'

export const ProtectedRoute = ({ children }) => {
	const { isUserAuthenticated } = useAuth()
	const location = useLocation()

	if (!isUserAuthenticated) {
		return <Navigate to='/' state={{ from: location }} replace />
	}

	return children
}
