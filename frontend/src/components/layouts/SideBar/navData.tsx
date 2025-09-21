import {
	CircleEllipsis,
	CircleUserRound,
	Home,
	ListMusic,
	Music,
	Settings,
	Users,
} from 'lucide-react'

import type { NavData } from './types'

export const navItems: NavData[] = [
	{ name: 'Главная', icon: <Home />, path: '/' },
	{ name: 'Треки', icon: <Music />, path: '/tracks' },
	{ name: 'Плейлисты', icon: <ListMusic />, path: '/playlists' },
	{ name: 'Настройки', icon: <Settings />, path: '/settings' },
]

export const navItemsBottom: NavItems[] = [
	{ name: 'Профиль', icon: <CircleUserRound />, path: '/profile' },
	{ name: 'Список Друзей', icon: <Users />, path: '/music' },
	{ name: 'Больше', icon: <CircleEllipsis />, path: '/list' },
]
