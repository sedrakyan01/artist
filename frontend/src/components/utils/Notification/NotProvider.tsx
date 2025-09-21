import React, { useCallback, useState } from 'react'
import { NotificationContext } from '../../context/Notification/NotContext'
import { createNotification } from './Notification'
import { NotificationContainer } from './NotContainer'
import type {
	Notification,
	NotificationContextType,
	NotificationProviderProps,
} from './types'

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
	children,
}) => {
	const [notifications, setNotifications] = useState<Notification[]>([])

	const removeNotification = useCallback((id: string) => {
		setNotifications(prev => prev.filter(n => n.id !== id))
	}, [])

	const addNotification = useCallback(
		(notification: Omit<Notification, 'id'>) => {
			const newNotification = createNotification(notification)

			setNotifications(prev => [...prev, newNotification])

			if (!notification.persistent) {
				setTimeout(() => {
					removeNotification(newNotification.id)
				}, newNotification.duration)
			}
		},
		[removeNotification]
	)

	const showError = useCallback(
		(title: string, message?: string | unknown) => {
			const msg =
				message && typeof message === 'object'
					? message instanceof Error
						? message.message
						: JSON.stringify(message)
					: (message as string | undefined)
			addNotification({ type: 'error', title, message: msg })
		},
		[addNotification]
	)

	const showSuccess = useCallback(
		(title: string, message?: string | unknown) => {
			const msg =
				message && typeof message === 'object'
					? message instanceof Error
						? message.message
						: JSON.stringify(message)
					: (message as string | undefined)
			addNotification({ type: 'success', title, message: msg })
		},
		[addNotification]
	)

	const showWarning = useCallback(
		(title: string, message?: string | unknown) => {
			const msg =
				message && typeof message === 'object'
					? message instanceof Error
						? message.message
						: JSON.stringify(message)
					: (message as string | undefined)
			addNotification({ type: 'warning', title, message: msg })
		},
		[addNotification]
	)

	const showInfo = useCallback(
		(title: string, message?: string | unknown) => {
			const msg =
				message && typeof message === 'object'
					? message instanceof Error
						? message.message
						: JSON.stringify(message)
					: (message as string | undefined)
			addNotification({ type: 'info', title, message: msg })
		},
		[addNotification]
	)

	const value: NotificationContextType = {
		notifications,
		addNotification,
		removeNotification,
		showError,
		showSuccess,
		showWarning,
		showInfo,
	}

	return (
		<NotificationContext.Provider value={value}>
			{children}
			<NotificationContainer
				notifications={notifications}
				onRemove={removeNotification}
			/>
		</NotificationContext.Provider>
	)
}
