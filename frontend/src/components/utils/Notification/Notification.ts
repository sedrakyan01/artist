import type { Notification } from './types'

export const generateNotificationId = (): string => {
	return Math.random().toString(36).substr(2, 9)
}

export const createNotification = (
	notification: Omit<Notification, 'id'>
): Notification => {
	return {
		...notification,
		id: generateNotificationId(),
		duration: notification.duration ?? 5000,
	}
}

export const notificationPresets = {
	apiError: {
		type: 'error' as const,
		title: 'Ошибка сервера',
		message: 'Не удалось выполнить запрос. Попробуйте позже.',
		duration: 7000,
	},

	authError: {
		type: 'error' as const,
		title: 'Ошибка авторизации',
		message: 'Неверный логин или пароль',
		duration: 5000,
	},

	validationError: {
		type: 'warning' as const,
		title: 'Проверьте данные',
		duration: 4000,
	},

	networkError: {
		type: 'error' as const,
		title: 'Проблемы с сетью',
		message: 'Проверьте подключение к интернету',
		duration: 6000,
	},

	saveSuccess: {
		type: 'success' as const,
		title: 'Сохранено',
		message: 'Данные успешно сохранены',
		duration: 3000,
	},
}
