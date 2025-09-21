import { Ellipsis, Heart, Play } from 'lucide-react'
import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

export const TrackItemSkeleton = () => {
	const { isDark } = useTheme()
	return (
		<>
			<div
				className={`group w-full flex items-center p-4 rounded-xl transition-colors duration-200  border border-transparent`}
			>
				<div className='w-10 text-center mr-4 font-semibold'>
					<span className={`text-gray-500 transition-colors duration-200`}>
						0
					</span>
				</div>
				<div className='relative w-14 h-14 mr-4 rounded-md overflow-hidden'>
					<div className='w-[56px] h-[56px] bg-[#36343F]' />
					<button className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 bg-black/50'>
						<div className='p-1.5 rounded-full bg-purple-500/90  transition-colors duration-200'>
							{/* <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> */}

							<Play size={16} className='text-white ml-0.5' />
						</div>
					</button>
				</div>
				<div className='flex-grow min-w-0'>
					<div className={`w-20 h-4 bg-[#36343F] mb-1`}></div>
					<div className={`w-24 h-4 bg-[#36343F] mb-1`}></div>
				</div>
				<div className='text-gray-400 text-xs transition-colors duration-200'>
					<div className='w-12 h-4 bg-[#36343F] mb-1' />
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
