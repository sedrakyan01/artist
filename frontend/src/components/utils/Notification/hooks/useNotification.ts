import { useContext } from 'react'
import { NotificationContext } from '../../../context/Notification/NotContext'
import type { NotificationContextType } from '../types'

export const useNotifications = (): NotificationContextType => {
	const context = useContext(NotificationContext)

	if (!context) {
		throw new Error(
			'useNotifications не может быть использована без провайдера'
		)
	}

	return context
}

export const useApiNotifications = () => {
	const { showError, showSuccess } = useNotifications()

	const handleApiError = () => {
		const message = 'Произошла ошибка'
		showError('Ошибка API', message)
	}

	const handleApiSuccess = (message = 'Операция выполнена успешно') => {
		showSuccess('Успех', message)
	}

	return { handleApiError, handleApiSuccess }
}
