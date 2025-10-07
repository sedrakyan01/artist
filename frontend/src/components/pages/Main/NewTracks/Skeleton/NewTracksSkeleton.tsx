import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

export const NewTracksSkeleton = () => {
	const { isDark } = useTheme()
	return (
		<>
			<div
				className={`group w-full flex items-center p-4 rounded-xl transition-colors duration-200 border-2 border-transparent animate-pulse`}
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
						className={`w-full h-full ${
							isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
						}`}
					/>
				</div>
				<div className='flex-grow min-w-0'>
					<div
						className={`w-20 h-[1.125rem] ${
							isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
						} mb-1 rounded`}
					></div>
					<div
						className={`w-24 h-[1.125rem] ${
							isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
						} mt-0 rounded`}
					></div>
				</div>
				<div className='flex gap-2 items-center text-gray-400 text-xs transition-colors duration-200'>
					<div
						className={`w-12 h-4 ${
							isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
						} rounded`}
					/>
				</div>
			</div>
		</>
	)
}
