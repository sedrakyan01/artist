import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../utils/Auth/hooks/useAuth'

export const LogOut = () => {
	const { setIsUserAuthenticated } = useAuth()
	const navigate = useNavigate()
	const handleLogout = async () => {
		try {
			const response = await fetch('http://localhost:8080/logout', {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			})

			if (response.ok) {
				const data = await response.json()
				console.log(data.message)

				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				setIsUserAuthenticated(false)
				navigate('/')
			} else {
				const errorText = await response.text()
				console.error(errorText)
			}
		} catch (error) {
			console.error('Ошибка выхода из системы:', error)
		}
	}

	return (
		<div>
			<button
				onClick={handleLogout}
				className='bg-purple-600 hover:bg-purple-700 text-white py-3 px-20 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 transform shadow-lg'
			>
				Выход
			</button>
		</div>
	)
}
