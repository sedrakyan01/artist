import type { ReactNode } from 'react'

export interface NavData {
	name: string
	icon: ReactNode
	path: string
	isActive?: boolean
}
