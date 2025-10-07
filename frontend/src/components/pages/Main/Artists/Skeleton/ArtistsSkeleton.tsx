export const ArtistsSkeleton = () => {
	return (
		<div className='flex-col mt-2 items-center w-[233px] rounded-xl py-3 bg-[#36343F] hover:bg-[#3a3841] transition-all duration-200 cursor-pointer animate-pulse'>
			<div className='flex-col flex items-center'>
				<div className='w-20 h-20 rounded-full border-4 border-purple-500/20  overflow-hidden shadow-xl mb-4'>
					<div className='bg-gradient-to-br from-purple-500 to-indigo-600 bg-cover bg-center w-full h-full'></div>
				</div>
				<div className='h-5 bg-[#24232B] rounded w-20 mb-3'></div>
				<div className='h-4 bg-[#24232B] rounded w-24 mb-1'></div>
				<div className='h-4 bg-[#24232B] rounded w-32'></div>
			</div>
		</div>
	)
}
