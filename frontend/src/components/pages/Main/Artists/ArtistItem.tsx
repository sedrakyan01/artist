const defaultImage = 'https://misc.scdn.co/liked-songs/liked-songs-640.png'
export const ArtistItem = ({ artist }) => {
	return (
		<div className='flex-col mt-2 items-center w-[233px] rounded-xl py-3  hover:bg-[#3a3841] transition-all duration-200 cursor-pointer'>
			<div className='flex-col flex items-center'>
				<div className='w-20 h-20 rounded-full border-4 border-purple-500/20 overflow-hidden shadow-xl mb-4'>
					<img src={defaultImage} alt='' />
				</div>
				<p className='mb-3 font-bold text-sm'>
					{artist.name[0].toUpperCase() + artist.name.slice(1)}
				</p>
				<p className='text-gray-400 mb-1 text-xs font-semibold'>777 подписчиков</p>
				<p className='text-gray-400 text-xs font-semibold'>{artist.plays} прослушиваний</p>
			</div>
		</div>
	)
}
