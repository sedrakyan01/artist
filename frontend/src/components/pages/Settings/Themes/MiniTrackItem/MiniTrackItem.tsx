import { Clock, Heart } from 'lucide-react'

import React from 'react'

import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

import type { TrackItemProps } from './types'

export const MiniTrackItem: React.FC<TrackItemProps> = React.memo(({ previewTheme }) => {
	const { isDark } = useTheme()
	
	const displayTheme = previewTheme || (isDark ? 'dark' : 'light')
	const isPreviewMode = previewTheme !== null
	const isLightTheme = displayTheme === 'light'

	const getThemeStyles = () => {
		if (isLightTheme) {
			return {
				container: isPreviewMode ? 'bg-white' : (isDark ? 'bg-transparent' : 'bg-white'),
				text: 'text-black',
				subtext: 'text-gray-600',
				icon: 'text-black'
			}
		} else {
			return {
				container: isPreviewMode ? 'bg-[#18161C]' : (isDark ? 'bg-[#18161C]' : 'bg-transparent'),
				text: 'text-white',
				subtext: 'text-[#7C7C7C]',
				icon: 'text-white'
			}
		}
	}

	const styles = getThemeStyles()

	return (
		<div className={`group w-full flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 border border-transparent ${styles.container} ${isPreviewMode ? 'transform shadow-lg' : ''}`}>
			<div className='relative w-14 h-14 mr-4 rounded-md overflow-hidden'>
				<div className={`ml-4 ${styles.icon} mt-5 transition-colors duration-300`}>
					<Heart />
				</div>
			</div>
			<div className='flex-grow min-w-0 mt-2'>
				<div className={`font-semibold ${styles.text} text-medium mb-0 truncate transition-colors duration-300`}>	
					{'Неизвестный трек'}
				</div>
				<div className={`${styles.subtext} text-sm truncate transition-colors duration-300`}>
					{'Неизвестный артист'}
				</div>
			</div>
			<div className='hidden sm:flex items-center text-gray-400 text-xs mr-4 transition-colors duration-300'>
				<Clock
					size={14}
					className={`mr-1.5 opacity-70 mt-2 ${styles.icon} transition-colors duration-300`}
				/>
				<span className={`${styles.text} font-medium text-sm mt-2 transition-colors duration-300`}>
					02:00
				</span>
			</div>
			<div className='flex items-center gap-2'>
				<button className={`p-1.5 rounded-full text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors duration-200`}>
				</button>
			</div>
		</div>
	)
})