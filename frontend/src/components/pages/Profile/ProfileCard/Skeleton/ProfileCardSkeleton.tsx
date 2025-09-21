import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

export const ProfileCardSkeleton:React.FC = () => {
	const randomColors = ['#36343F', '#3a3841', '#24232B']
	const { isDark } = useTheme()
	return (
		<div className='animate-pulse border-none rounded-2xl shadow-xl overflow-hidden font-sans transform transition-all hover:shadow-2xl'>
			<div className='relative h-48 bg-cover bg-center bg-gradient-to-br from-purple-500 to-indigo-600'>
				<div className='absolute bottom-0 w-full h-16'>
					<svg
						className='w-full h-full'
						viewBox='0 0 100 20'
						preserveAspectRatio='none'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M0 10 Q 25 0, 50 10 T 100 10'
							fill='none'
							stroke='rgba(255, 255, 255, 0.3)'
							strokeWidth='2'
						/>
						<path
							d='M0 15 Q 25 5, 50 15 T 100 15'
							fill='none'
							stroke='rgba(255, 255, 255, 0.3)'
							strokeWidth='2'
						/>
					</svg>
				</div>
			</div>

			<div
				className={`relative ${
					isDark ? 'bg-[#24232B] border-[#33313E]' : 'bg-[#E5E7EB] border-none'
				} border-t`}
			>
				<div className='absolute -top-16 left-8'>
					<div className='relative group'>
						<div
							className={`w-32 h-32 rounded-full border-4 ${
								isDark ? 'border-[#28262F]' : 'border-[#E5E7EB]'
							} overflow-hidden shadow-xl`}
						>
							<div className='w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center'></div>
						</div>
						<div
							className={`absolute inset-0 rounded-full bg-${
								randomColors[Math.floor(Math.random() * randomColors.length)]
							} bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 cursor-pointer`}
						></div>
					</div>
				</div>

				<div className='pt-20 pb-6 px-8 h-[288px]'>
					<div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-0'>
						<div className='mt-3'>
							<div
								className={`h-7 ${
									isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
								} rounded w-48 mb-2`}
							></div>

							<div
								className={`h-7 ${
									isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
								} rounded w-20 mb-1`}
							></div>
						</div>

						<div className='flex flex-wrap gap-3 mt-2'>
							<button
								className={`${
									isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
								} w-[138.64px] h-[44px] text-white px-6 py-2.5 rounded-lg transition-colors duration-300 shadow-md font-medium`}
							></button>
							<button
								className={`${
									isDark ? 'bg-[#36343F]' : 'bg-[#d5d7da]'
								}  w-[204.39px] h-[44px] text-white px-6 py-2.5 rounded-lg  transition-colors duration-300 shadow-md font-medium`}
							></button>
							<button className='w-[163.56px] h-[44px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2.5 rounded-md transition-all duration-300 transform shadow-md font-medium'></button>
						</div>
					</div>

					<div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4'>
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className={`flex flex-col items-center px-4 py-4 w-[316.2px] h-[87.99px] rounded-xl ${
									isDark
										? 'bg-[#36343F] hover:bg-[#3a3841]'
										: 'bg-[#d5d7da] hover:bg-[#c9ccd2]'
								}transition-colors duration-200 cursor-pointer`}
							></div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
