export const ArtistsSkeleton = () => {
	return (
		<div className='flex-col mt-2 items-center w-[230px] rounded-xl py-4 bg-[#36343F] hover:bg-[#3a3841] transition-all duration-200 cursor-pointer animate-pulse'>
			<div className='flex-col flex items-center'>
				<div className='w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 bg-cover bg-center overflow-hidden shadow-xl mb-4'></div>
				<div className='h-5 bg-[#24232B] rounded w-20 mb-2'></div>
				<div className='h-3 bg-[#24232B] rounded w-24'></div>
			</div>
		</div>
	)
}
