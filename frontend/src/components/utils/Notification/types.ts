export interface Notification {
	id: string
	type: 'error' | 'success' | 'warning' | 'info'
	title: string
	message?: string
	duration?: number
	persistent?: boolean
}

export interface NotificationContextType {
	notifications: Notification[]
	addNotification: (notification: Omit<Notification, 'id'>) => void
	removeNotification: (id: string) => void
	showError: (title: string, message?: string) => void
	showSuccess: (title: string, message?: string) => void
	showWarning: (title: string, message?: string) => void
	showInfo: (title: string, message?: string) => void
}

export type NotificationProps = {
	notification: Notification
	onRemove: (id: string) => void
}

export type NotificationContainerProps = {
	notifications: Notification[]
	onRemove: (id: string) => void
}

export interface NotificationProviderProps {
	children: ReactNode
}
