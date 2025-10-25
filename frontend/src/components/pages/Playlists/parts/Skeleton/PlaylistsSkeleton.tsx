import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

export const PlaylistsSkeleton = () => {
	const { isDark } = useTheme()
	return (
		<div className={`group flex justify-center flex-col cursor-pointer ${isDark ? 'bg-[#2a2831]' : 'bg-[#d5d7da]'} p-4 rounded-lg transition-all duration-300 shadow-lg`}>
			<div className='relative mb-4 overflow-hidden rounded-md shadow-xl'>
				<div
					className={`w-full aspect-square ${
						isDark ? 'bg-[#36343F]' : 'bg-[#c2c4c6]'
					} animate-pulse`}
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
			</div>
			<div>
				<div
					className={`w-4/5 h-5 mb-3 ${
						isDark ? 'bg-[#36343F]' : 'bg-[#a4a5a7]'
					} rounded animate-pulse`}
				></div>
				<div
					className={`w-full h-4 ${
						isDark ? 'bg-[#36343F]' : 'bg-[#a4a5a7]'
					} rounded animate-pulse`}
				></div>
			</div>
		</div>
	)
}
