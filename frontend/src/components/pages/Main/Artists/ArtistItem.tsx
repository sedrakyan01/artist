const defaultImage = 'https://misc.scdn.co/liked-songs/liked-songs-640.png'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const ArtistItem = ({ artist }) => {
	const { isDark } = useTheme()
	return (
		<div className='relative group w-[233px] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer'>
			<div className='absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

			<div
				className={`relative ${
					isDark ? 'bg-[#2a2831] border-[#2a2831]' : 'bg-[#e5e7eb] border-none'
				} transition-all duration-300 rounded-2xl p-6 border-2 group-hover:border-purple-500`}
			>
				<div className='relative mx-auto w-32 h-32 mb-5'>
					<div className='relative w-full h-full rounded-full border-4 border-purple-500/20 overflow-hidden shadow-2xl transition-all duration-300'>
						<img
							src={defaultImage}
							alt={artist.name}
							className='w-full h-full object-cover transition-transform duration-300'
						/>

						<div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
					</div>
				</div>

				<h3
					className={`text-center font-bold text-base mb-3 ${
						isDark ? 'text-white' : 'text-gray-700'
					} group-hover:text-purple-500 transition-colors duration-300 truncate`}
				>
					{artist.name[0].toUpperCase() + artist.name.slice(1)}
				</h3>

				<div className='space-y-2'>
					<div
						className={`flex items-center justify-center gap-2 ${
							isDark ? 'bg-[#34333b]' : 'bg-[#d5d7da]'
						} rounded-lg p-2.5 transition-colors duration-300`}
					>
						<span
							className={`text-xs font-semibold ${
								isDark ? 'text-gray-300' : 'text-gray-700'
							}`}
						>
							{artist.plays === 0 ? 'Без прослушиваний' : artist.plays}
							{artist.plays > 0 && (
								<span
									className={`${
										isDark ? 'text-gray-300' : 'text-gray-700'
									} ml-1`}
								>
									прослушиваний
								</span>
							)}
						</span>
					</div>

					<div
						className={`flex items-center justify-center gap-2 ${
							isDark ? 'bg-[#34333b]' : 'bg-[#d5d7da]'
						} rounded-lg p-2.5 transition-colors duration-300`}
					>
						<span className={`text-xs font-semibold ${isDark ? 'text-purple-500' : 'text-purple-700'}`}>
							20070702
							<span
								className={`ml-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
							>
								подписчиков
							</span>
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
