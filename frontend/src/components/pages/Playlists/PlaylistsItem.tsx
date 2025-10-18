import { useTheme } from '../../utils/Theme/hooks/useTheme'

import { CircleArrowRight } from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { useState } from 'react'

import { AllPlaylists } from './parts/AllPlaylists'
import { MyPlaylists } from './parts/MyPlaylists'

export const PlaylistsItem = () => {
	const { isDark } = useTheme()
	const navigate = useNavigate()

	const [activeSection, setActiveSection] = useState<'my' | 'all'>('my')

	return (
		<div
			className={`w-full h-auto ${
				isDark ? 'bg-[#24232B]' : 'bg-[#E5E7EB]'
			} rounded-xl p-8`}
		>
			<div className='flex items-center justify-between'>
				<div className='flex gap-12'>
					<h2
						onClick={() => {
							setActiveSection('my')
						}}
						className={`text-2xl font-bold ${
							isDark
								? `${
										activeSection === 'my'
											? 'text-purple-500 underline underline-offset-10'
											: 'text-white'
								  }`
								: `${
										activeSection === 'my'
											? 'text-purple-700 underline underline-offset-10'
											: 'text-black'
								  }`
						} mb-6 cursor-pointer`}
					>
						Мои плейлисты
					</h2>
					<h2
						onClick={() => {
							setActiveSection('all')
						}}
						className={`text-2xl font-bold ${
							isDark
								? `${
										activeSection === 'all'
											? 'text-purple-500 underline underline-offset-10'
											: 'text-white'
								  }`
								: `${
										activeSection === 'all'
											? 'text-purple-700 underline underline-offset-10'
											: 'text-black'
								  }`
						} mb-6 cursor-pointer`}
					>
						Все плейлисты
					</h2>
				</div>
				<CircleArrowRight
					data-tooltip-id='more-new-tracks'
					data-tooltip-content='Больше'
					size={30}
					onClick={() => {
						navigate('/tracks')
					}}
					className={`${
						isDark ? 'text-primary-GRAY' : 'text-black'
					} hover:scale-105 cursor-pointer mr-4 mt-[-20px] transition-transform duration-200`}
				/>
			</div>
			{activeSection === 'my' ? <MyPlaylists /> : <AllPlaylists />}
		</div>
	)
}
