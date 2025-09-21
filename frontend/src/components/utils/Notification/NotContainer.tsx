import React from 'react'
import { NotificationItem } from './NotItem'
import type { NotificationContainerProps } from './types'

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
	notifications,
	onRemove,
}) => {
	if (notifications.length === 0) return null

	return (
		<div className='fixed bottom-4 right-2 z-[500000] space-y-3'>
			{notifications.map(notification => (
				<NotificationItem
					key={notification.id}
					notification={notification}
					onRemove={onRemove}
				/>
			))}
		</div>
	)
}

export default NotificationContainer
