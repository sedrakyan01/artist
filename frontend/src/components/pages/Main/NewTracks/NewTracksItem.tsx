import { Ellipsis, Heart, Play } from 'lucide-react'

import { IoMdPause } from 'react-icons/io'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import { FormatDuration } from '../../../utils/FormatDuration/FormatDuration'

import { useAudioContext } from '../../../context/Audio/exports'

import { useAuth } from '../../../utils/Auth/hooks/useAuth'

import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

export const NewTracksItem = ({
	track,
	index,
	trackList = [],
}: NewTracksItemProps) => {
	const { togglePlayPause, currentTrack, isPlaying } = useAudioContext()
	const { isDark } = useTheme()

	const { showError } = useNotifications()

	const isCurrentTrack = currentTrack?.track_id === track.track_id

	const { isUserAuthenticated } = useAuth()

	const handleClick = async (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		e.stopPropagation()
		if (isUserAuthenticated) {
			await togglePlayPause(track, trackList)
		} else {
			showError('Вы должны войти в систему для прослушивания треков')
		}
	}

	return (
		<>
			<div
				className={`group w-full flex items-center ${
					isCurrentTrack
						? 'bg-gradient-to-r from-[#36343F]/80 to-[#42404D]/60 border-purple-500/20 border'
						: ''
				} p-4 rounded-xl cursor-pointer transition-colors duration-200 ${
					isDark
						? 'hover:bg-gradient-to-r hover:from-[#36343F]/80 hover:to-[#42404D]/60'
						: 'hover:bg-[#c9ccd2]'
				} border-2 border-transparent hover:border-purple-500/20`}
			>
				<div className='w-10 text-center mr-4 font-semibold'>
					<span
						className={`text-gray-500 ${
							isDark ? 'group-hover:text-purple-300' : 'group-hover:text-black'
						} transition-colors duration-200`}
					>
						{index + 1}
					</span>
				</div>
				<div className='relative w-14 h-14 mr-4 rounded-md overflow-hidden'>
					<img
						src={
							track.track_picture
								? `data:image/jpeg;base64,${track.track_picture}`
								: 'https://via.placeholder.com/100'
						}
						alt='Обложка трека'
						className='w-full h-full object-cover transition-transform duration-200 group-hover:scale-105'
						loading='lazy'
						onError={e =>
							((e.target as HTMLImageElement).src =
								'https://via.placeholder.com/100')
						}
					/>
					{/* <button
						className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50`}
					>
						<div
							onClick={handleClick}
							className='w-10 h-10 rounded-full text-center flex items-center justify-center bg-purple-500/90 hover:bg-purple-500 transition-colors cursor-pointer duration-200'
						>
							{isCurrentTrack && isPlaying ? (
								<IoMdPause
									size={22}
									className='text-white ml-0 cursor-pointer'
								/>
							) : (
								<Play size={22} className='text-white ml-0 cursor-pointer' />
							)}
						</div>
					</button> */}
				</div>
				<div className='flex-grow min-w-0'>
					<div
						className={`font-semibold text-sm mb-0 truncate ${
							isDark
								? 'text-white group-hover:text-purple-300'
								: 'text-black  group-hover:text-purple-800'
						} transition-colors duration-200`}
					>
						{track.title || 'Неизвестный трек'}
					</div>
					<div
						className={`${
							isDark
								? 'text-gray-400 group-hover:text-gray-300'
								: 'text-gray-600 group-hover:text-gray-600'
						} text-sm truncate transition-colors duration-200`}
					>
						{track.artist_name || 'Неизвестный артист'}
					</div>
				</div>
				<div
					className={`flex gap-2 items-center text-gray-400 ${
						isCurrentTrack && isPlaying
							? 'text-gray-300 hidden'
							: 'text-gray-600 group-hover:hidden'
					} text-xs group-hover:text-gray-300 transition-colors duration-200`}
				>
					<span className='font-medium'>{FormatDuration(track.duration)}</span>
				</div>
				<div
					className={`items-center group-hover:flex gap-2 icons-container ${
						isCurrentTrack && isPlaying ? 'flex' : 'hidden'
					}`}
				>
					<button
						onClick={handleClick}
						className={`p-1.5 rounded-full ${
							isDark
								? 'text-gray-400 hover:text-purple-400'
								: 'text-black hover:text-purple-800'
						} hover:bg-purple-500/10 transition-colors duration-200 cursor-pointer`}
					>
						{isCurrentTrack && isPlaying ? (
							<IoMdPause size={18} className={`ml-0.5`} />
						) : (
							<Play size={18} className={`ml-0.5`} />
						)}
					</button>
					<button
						className={`p-1.5 rounded-full ${
							isDark ? 'text-gray-400' : 'text-black'
						} hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer`}
						aria-label='Лайк'
					>
						<Heart size={18} className='cursor-pointer' />
					</button>
					<button
						className={`p-1.5 rounded-full ${
							isDark ? 'text-gray-400' : 'text-black'
						} hover:text-emerald-600 hover:bg-emerald-600/10 transition-colors duration-200 cursor-pointer`}
						aria-label='Лайк'
					>
						<Ellipsis size={18} className='cursor-pointer' />
					</button>
				</div>
			</div>
		</>
	)
}
