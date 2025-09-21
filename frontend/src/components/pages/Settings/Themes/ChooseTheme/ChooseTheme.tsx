import { useState } from 'react'
import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

export const ChooseTheme = ({ onThemeHover }) => {
	const { theme, setTheme } = useTheme()
	const { isDark } = useTheme()
	const [hoveredTheme, setHoveredTheme] = useState(null)

	const handleMouseEnter = themeType => {
		setHoveredTheme(themeType)
		onThemeHover(themeType)
	}

	const handleMouseLeave = () => {
		setHoveredTheme(null)
		onThemeHover(null)
	}

	return (
		<div className='mt-12'>
			<div>
				<p
					className={`mb-1 text-xl font-bold ${
						isDark ? 'text-white' : 'text-black'
					}`}
				>
					Темы по умолчанию
				</p>
				<p
					className={` font-semibold ${
						isDark ? 'text-[#7C7C7C]' : 'text-black'
					}`}
				>
					Регулирует цвет интерфейса для оптимизации видимости.
				</p>
			</div>
			<div className='flex items-center mt-4 gap-4'>
				<div
					className={`w-20 h-20 bg-white rounded-full cursor-pointer border-4 transition-all hover:scale-110 ${
						theme === 'light' ? 'border-purple-500' : 'border-transparent'
					} ${hoveredTheme === 'light' ? '' : ''}`}
					onClick={() => setTheme('light')}
					onMouseEnter={() => handleMouseEnter('light')}
					onMouseLeave={handleMouseLeave}
				/>

				<div
					className={`w-20 h-20 bg-[#18161C] rounded-full cursor-pointer border-4 transition-all hover:scale-110 ${
						theme === 'dark' ? 'border-purple-500' : 'border-transparent'
					} ${hoveredTheme === 'dark' ? '' : ''}`}
					onClick={() => setTheme('dark')}
					onMouseEnter={() => handleMouseEnter('dark')}
					onMouseLeave={handleMouseLeave}
				/>
			</div>
		</div>
	)
}
