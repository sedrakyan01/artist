import { TrendingDown, TrendingUp } from 'lucide-react'
import type { Genre } from './types'

import picture1 from '../../../../../public/picture1.jpg'
import picture2 from '../../../../../public/picture2.jpg'
import picture3 from '../../../../../public/picture3.jpg'
import picture4 from '../../../../../public/picture4.jpg'
import picture5 from '../../../../../public/picture5.jpg'
import picture6 from '../../../../../public/picture6.jpg'
import picture7 from '../../../../../public/picture7.png'
import picture8 from '../../../../../public/picture8.png'

export const genresData: Genre[] = [
	{
		name: 'Поп',
		id: 1,
		playsCount: '11M',
		artistsCount: '12К',
		graphicIcon: <TrendingDown size={30} />,
		color: '#1288C4',
		backgroundImage: picture8,
	},
	{
		name: 'Рок',
		id: 2,
		playsCount: '1.5M',
		artistsCount: '12К',
		graphicIcon: <TrendingUp size={30} />,
		color: '#7750D3',
		backgroundImage: picture2,
	},
	{
		name: 'Хип-Хоп',
		id: 3,
		playsCount: '5.5M',
		artistsCount: '12К',
		graphicIcon: <TrendingUp size={30} />,
		color: '#5099A8',
		backgroundImage: picture3,
	},
	{
		name: 'Джаз',
		id: 4,
		playsCount: '1M',
		artistsCount: '12К',
		graphicIcon: <TrendingDown size={30} />,
		color: '#E13D30',
		backgroundImage: picture4,
	},
	{
		name: 'Классика',
		id: 5,
		playsCount: '920K',
		artistsCount: '12К',
		graphicIcon: <TrendingDown size={30} />,
		color: '#A65151',
		backgroundImage: picture5,
	},
	{
		name: 'Метал',
		id: 6,
		playsCount: '2B',
		artistsCount: '12К',
		graphicIcon: <TrendingUp size={30} />,
		color: '#959595',
		backgroundImage: picture6,
	},
	{
		name: 'Диско',
		id: 7,
		playsCount: '34M',
		artistsCount: '12К',
		graphicIcon: <TrendingUp size={30} />,
		color: '#B97002',
		backgroundImage: picture7,
	},
	{
		name: 'Фолк',
		id: 8,
		playsCount: '55K',
		artistsCount: '12К',
		graphicIcon: <TrendingDown size={30} />,
		color: '#B63978',
		backgroundImage: picture1,
	},
]
