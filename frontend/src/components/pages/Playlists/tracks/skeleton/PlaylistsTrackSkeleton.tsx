import { Ellipsis, Heart, Play } from 'lucide-react'
import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

export const PlaylistItemSkeleton = () => {
	const { isDark } = useTheme()
	return (
		<>
			<div
				className={`group mt-4 w-full flex items-center p-4 rounded-xl transition-colors duration-200 border border-transparent animate-pulse`}
			>
				<div className='w-10 text-center mr-4 font-semibold'>
					<div
						className={`${
							isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
						} w-8 h-4 transition-colors duration-200`}
					></div>
				</div>
				<div className='relative w-14 h-14 mr-4 rounded-md overflow-hidden'>
					<div
						className={`w-[56px] h-[56px] ${
							isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
						}`}
					/>
					<button className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 bg-black/50'>
						<div className='p-1.5 rounded-full bg-purple-500/90  transition-colors duration-200'>
							{/* <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> */}

							<Play size={16} className='text-white ml-0.5' />
						</div>
					</button>
				</div>
				<div className='flex-grow min-w-0'>
					<div
						className={`w-20 h-4 ${
							isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
						} mb-1`}
					></div>
					<div
						className={`w-24 h-4 ${
							isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
						} mb-1`}
					></div>
				</div>
				<div className='text-gray-400 text-xs transition-colors duration-200'>
					<div
						className={`w-12 h-4 ${
							isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
						} mb-1`}
					/>
					{/* <Clock size={14} className='mr-1.5 opacity-70' /> */}
				</div>
				<div className='items-center gap-2 hidden icons-container'>
					<button
						className={`p-1.5 rounded-full transition-colors duration-200`}
					>
						{/* <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> */}
						<Play size={18} className='ml-0.5' />
					</button>
					<button
						className={`p-1.5 rounded-full ${
							isDark ? 'text-gray-400' : 'text-black'
						}  transition-colors duration-200`}
						aria-label='Лайк'
					>
						<Heart size={18} className='cursor-pointer' />
					</button>
					<button
						className={`p-1.5 rounded-full ${
							isDark ? 'text-gray-400' : 'text-black'
						} transition-colors duration-200 cursor-pointer`}
						aria-label='Лайк'
					>
						<Ellipsis size={18} className='cursor-pointer' />
					</button>
				</div>
			</div>
		</>
	)
}
