import { useState } from 'react'
import { useTheme } from '../../../utils/Theme/hooks/useTheme'
import { ChooseTheme } from './ChooseTheme/ChooseTheme'
import { MiniTrackItem } from './MiniTrackItem/MiniTrackItem'

export const Themes = () => {
	const { isDark } = useTheme()
	const [hoveredTheme, setHoveredTheme] = useState(null)

	const handleThemeHover = themeType => {
		setHoveredTheme(themeType)
	}

	return (
		<div>
			<div
				className={`${
					isDark ? 'bg-[#24232B]' : 'bg-[#E5E7EB]'
				} rounded-xl w-full p-8 h-auto transition-colors duration-300`}
			>
				<div>
					<h1
						className={`text-2xl font-bold mb-6 ${
							isDark ? 'text-white' : 'text-black'
						}`}
					>
						Внешний вид
					</h1>
				</div>

				<div
					className={`${
						isDark ? 'bg-[#18161c]' : 'bg-[#fff]'
					}  w-full rounded-md transition-colors duration-300`}
				>
					<MiniTrackItem previewTheme={hoveredTheme} />
				</div>

				<ChooseTheme onThemeHover={handleThemeHover} />
			</div>
		</div>
	)
}
