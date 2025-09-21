import { CircleArrowRight } from 'lucide-react'
import React from 'react'
import { Tooltip } from 'react-tooltip'
import { genresData } from './genresData'
import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const Genres: React.FC = () => {
	const { isDark } = useTheme()
	return (
		<div className={`w-full ${isDark ? 'bg-[#24232B]' : 'bg-[#E5E7EB]'} rounded-xl p-8`}>
			<div className='flex items-center justify-between'>
				<h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-6`}>Популярные жанры</h2>
				<CircleArrowRight
					data-tooltip-id='more-genres'
					data-tooltip-content='Больше'
					size={30}
					className={`${isDark ? 'text-primary-GRAY' : 'text-black'} hover:scale-105 cursor-pointer mr-4 mt-[-20px] transition-transform duration-200`}
				/>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
				{genresData.map(genre => (
					<div
						key={genre.id}
						className={`
        group relative overflow-hidden rounded-xl p-6 cursor-pointer
        transition-all h-[174px] duration-300 hover:scale-105 hover:shadow-2xl opacity-90
      `}
						style={{
							backgroundColor: genre.color,
							backgroundImage: `url(${genresData.backgroundImage})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
					>
						<div className='absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40' />

						<div className='relative z-10'>
							<h3 className='text-xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors drop-shadow-lg'>
								{genre.name}
							</h3>
							<div className='text-white/90 drop-shadow-md'>
								<h4 className='font-semibold text-sm'>
									Прослушиваний: {genre.playsCount}
								</h4>
								<h4 className='font-semibold text-sm'>
									Артистов: {genre.artistsCount}
								</h4>
							</div>
							<div className='float-right mt-3 text-white drop-shadow-lg'>
								{genre.graphicIcon}
							</div>
						</div>

						<div className='absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
					</div>
				))}
			</div>

			<Tooltip
				id='more-genres'
				place='top'
				noArrow
				className='!bg-[#24232B] !text-white absolute !rounded-md !font-semibold !transition-none shadow-lg !animation-none'
			/>
		</div>
	)
}
