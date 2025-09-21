import type { ReactNode } from 'react'

export interface Genre {
	id: number
	name: string
	playsCount: string
	artistsCount: string
	graphicIcon: ReactNode
	color: string
	backgroundImage: string
}
