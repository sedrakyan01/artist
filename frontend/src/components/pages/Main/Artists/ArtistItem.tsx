const defaultImage = 'https://misc.scdn.co/liked-songs/liked-songs-640.png'
export const ArtistItem = ({ artist }) => {
	return (
		<div className='flex-col mt-2 items-center w-[230px] rounded-xl py-4 bg-[#36343F] hover:bg-[#3a3841] transition-all duration-200 cursor-pointer'>
			<div className='flex-col flex items-center'>
				<div className='w-20 h-20 rounded-full border-4 border-purple-500/20 overflow-hidden shadow-xl mb-4'>
					<img src={defaultImage} alt='' />
				</div>
				<p className='text-sm mb-1'>
					{artist.name[0].toUpperCase() + artist.name.slice(1)}
				</p>
				<p className='text-gray-400 text-xs'>{artist.plays} прослушиваний</p>
			</div>
		</div>
	)
}
