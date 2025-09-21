import { createContext } from 'react'
import type { NotificationContextType } from '../../utils/Notification/types'

export const NotificationContext = createContext<
	NotificationContextType | undefined
>(undefined)
