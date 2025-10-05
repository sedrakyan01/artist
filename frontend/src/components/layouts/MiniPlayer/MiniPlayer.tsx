import { ListPlus, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { CgDisplaySpacing } from 'react-icons/cg'
import { FaPause, FaPlay } from 'react-icons/fa'
import { AudioContext } from '../../context/Audio/exports'
import { FormatDuration } from '../../utils/FormatDuration/FormatDuration'
import { PlaylistSelector } from '../PlaylistSelector/PlaylistSelector'
import { TrackInfo } from '../TrackInfo/TrackInfo'

import { useNotifications } from '../../utils/Notification/hooks/useNotification'

import { useTheme } from '../../utils/Theme/hooks/useTheme'

const defaultImage = 'https://misc.scdn.co/liked-songs/liked-songs-640.png'

export const MiniPlayer: React.FC = () => {
	const audioContext = useContext(AudioContext)

	const { showError, showSuccess } = useNotifications()

	const { isDark } = useTheme()

	const [volume, setVolume] = useState<number>(1)
	const [isMuted, setIsMuted] = useState<boolean>(false)
	const [prevVolume, setPrevVolume] = useState<number>(1)
	const [isTrackInfoOpen, setIsTrackInfoOpen] = useState<boolean>(false)
	const [isPlaylistSelectorOpen, setIsPlaylistSelectorOpen] =
		useState<boolean>(false)
	const [isHovering, setIsHovering] = useState<boolean>(false)
	const [isScrubbing, setIsScrubbing] = useState<boolean>(false)
	const [scrubValue, setScrubValue] = useState<number>(0)

	const {
		currentTrack,
		isPlaying,
		currentTime,
		audioDuration,
		audioRef,
		togglePlayPause,
		handleSeek,
		playNextTrack,
		playPreviousTrack,
		error,
		isLoading,
	} = audioContext

	useEffect(() => {
		const audio = audioRef?.current
		if (audio) {
			audio.volume = volume
		}
	}, [volume, audioRef])

	if (!audioContext) {
		console.error('AudioContext не предоставлен')
		return null
	}

	const defaultTrack: Track = {
		track_id: '',
		title: '',
		artist_name: '',
		duration: 0,
		track_picture: '',
		id: '',
	}

	const track = currentTrack || defaultTrack
	const isTrackSelected = !!currentTrack

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(e.target.value)
		setVolume(newVolume)
		if (newVolume > 0 && isMuted) {
			setIsMuted(false)
		}
	}

	const toggleMute = () => {
		if (isMuted) {
			setVolume(prevVolume || 0.5)
			setIsMuted(false)
		} else {
			setPrevVolume(volume)
			setVolume(0)
			setIsMuted(true)
		}
	}

	const togglePlaylistSelector = () => {
		if (!isTrackSelected) return
		setIsPlaylistSelectorOpen(prev => !prev)
	}

	const toggleTrackInfo = () => {
		setIsTrackInfoOpen(!isTrackInfoOpen)
	}

	const handlePlayPause = async () => {
		if (!isTrackSelected) {
			return
		}

		await togglePlayPause(track, [])
	}

	const onScrubStart = () => {
		setIsScrubbing(true)
		setScrubValue(currentTime)
	}

	const onScrubMove = (value: number) => {
		setScrubValue(value)
		handleSeek(value)
	}

	const onScrubEnd = () => {
		setIsScrubbing(false)
		handleSeek(scrubValue)
	}

	const handleAddToPlaylist = async (playlistId: string, track: Track) => {
		try {
			const token =
				typeof window !== 'undefined'
					? localStorage.getItem('accessToken')
					: null

			if (!token) {
				showError('Не удалось добавить трек в плейлист')
			}

			const response = await fetch(`http://localhost:8080/addtracktoplaylist`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
				body: JSON.stringify({
					playlistName: playlistId,
					trackId: track.track_id,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				showError('Не удалось добавить трек в плейлист', errorText)
			}

			showSuccess('Трек успешно добавлен в плейлист')
		} catch (error) {
			showError('Ошибка добавления трека в плейлист:', error)
			throw error
		}
	}

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 ${
				isDark ? 'bg-[#18161c] border-[#2A293F]' : 'bg-[#fff] border-[#e5e7eb]'
			} backdrop-blur-md border-t p-4 flex items-center z-10 shadow-lg transition-all duration-300`}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
			style={{ height: '90px' }}
		>
			<div className='flex items-center w-56'>
				<div className='w-16 h-16 min-w-16 rounded-lg overflow-hidden shadow-md transition-transform duration-300 group'>
					<img
						src={
							track.track_picture
								? `data:image/jpeg;base64,${track.track_picture}`
								: defaultImage
						}
						alt='Now playing'
						className='w-full h-full object-cover group-hover:brightness-110'
						onError={e => (e.currentTarget.src = defaultImage)}
					/>
				</div>
				<div className='ml-4 w-36 overflow-hidden'>
					<div
						className={`${
							isDark ? 'text-white' : 'text-black'
						} font-medium text-sm truncate`}
					>
						{track.title}
					</div>
					<div className='text-gray-400 text-xs truncate'>
						{track.artist_name}
					</div>
				</div>
			</div>

			<div className='flex-1 min-w-96 flex flex-col items-center px-4'>
				{error && isTrackSelected && (
					<div className='text-red-400 text-xs mb-2'>{error}</div>
				)}
				<div className='flex items-center justify-center gap-6 mb-2 w-full'>
					<button
						onClick={playPreviousTrack}
						className={`w-8 h-8 flex items-center justify-center transition-all duration-200 cursor-pointer ${
							isTrackSelected
								? 'text-gray-400 hover:text-white'
								: 'text-gray-600 cursor-pointer'
						}`}
						disabled={!isTrackSelected || isLoading}
						aria-label='Previous track'
					>
						<SkipBack size={18} />
					</button>
					<button
						onClick={handlePlayPause}
						className={`w-10 cursor-pointer h-10 rounded-full flex items-center justify-center transition-all duration-200 transform ${
							isTrackSelected
								? 'bg-[#A855F7] hover:bg-[#9333EA] text-white'
								: `${
										isDark
											? 'bg-gray-600 text-gray-400'
											: 'bg-[#e5e7eb] text-[black]'
								  } cursor-pointer`
						}`}
						disabled={!isTrackSelected || isLoading}
						aria-label={isPlaying && isTrackSelected ? 'Pause' : 'Play'}
					>
						{isPlaying && isTrackSelected ? (
							<div>
								<FaPause size={14} />
							</div>
						) : (
							<div className='text-center cursor-pointer flex justify-center'>
								<FaPlay size={14} className='ml-1' />
							</div>
						)}
					</button>
					<button
						onClick={playNextTrack}
						className={`w-8 h-8 flex items-center justify-center transition-all duration-200 cursor-pointer ${
							isTrackSelected
								? 'text-gray-400 hover:text-white'
								: 'text-gray-600 cursor-pointer'
						}`}
						disabled={!isTrackSelected || isLoading}
						aria-label='Next track'
					>
						<SkipForward size={18} />
					</button>
				</div>

				<div className='flex items-center justify-center w-full'>
					<span className='text-gray-400 text-xs mr-3 tabular-nums w-8 text-right'>
						{FormatDuration(currentTime)}
					</span>
					<div className='relative w-full max-w-md h-5 flex items-center'>
						<input
							type='range'
							min='0'
							max={audioDuration || 100}
							value={isScrubbing ? scrubValue : currentTime}
							onInput={e => {
								const v = parseFloat((e.target as HTMLInputElement).value)
								onScrubMove(v)
							}}
							onPointerDown={() => onScrubStart()}
							onPointerUp={() => onScrubEnd()}
							onChange={e => {
								const v = parseFloat((e.target as HTMLInputElement).value)
								handleSeek(v)
							}}
							className='absolute w-full h-5 rounded-full appearance-none cursor-pointer z-10 opacity-0'
							disabled={!isTrackSelected || isLoading}
						/>
						<div
							className={`absolute w-full h-1 ${
								isDark ? 'bg-gray-700' : 'bg-[#e5e7eb]'
							} rounded-full overflow-hidden transition-all duration-200`}
						>
							<div
								className='h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-100'
								style={{
									width: `${(currentTime / (audioDuration || 100)) * 100}%`,
								}}
							></div>
						</div>
						<div
							className={`absolute h-3 w-3 rounded-full ${
								isDark ? 'bg-white' : 'bg-purple-500'
							} shadow-md transition-all duration-100 ease-out`}
							style={{
								left: `calc(${
									(currentTime / (audioDuration || 100)) * 100
								}% - 6px)`,
								opacity: isHovering && isTrackSelected ? 1 : 0.7,
								transform:
									isHovering && isTrackSelected ? 'scale(1.2)' : 'scale(1)',
								boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
							}}
						></div>
					</div>
					<span className='text-gray-400 text-xs ml-3 tabular-nums w-8'>
						{FormatDuration(audioDuration || track.duration)}
					</span>
				</div>
			</div>

			<div className='flex items-center space-x-4 w-48 justify-end'>
				<button
					onClick={toggleTrackInfo}
					className={`p-2 rounded-full transition-colors ${
						isTrackSelected
							? `cursor-pointer ${
									isDark
										? 'hover:bg-[#2A2730] text-gray-400 hover:text-white'
										: 'hover:bg-[#d5d7da] hover:text-black'
							  }`
							: 'text-gray-600 cursor-pointer'
					}`}
					disabled={!isTrackSelected}
					aria-label='Track info'
				>
					<CgDisplaySpacing size={20} />
				</button>
				<button
					onClick={togglePlaylistSelector}
					className={`p-2 rounded-full transition-colors ${
						isTrackSelected
							? 'text-gray-400 hover:text-white cursor-pointer hover:bg-[#2A2730]'
							: 'text-gray-600 cursor-pointer'
					}`}
					disabled={!isTrackSelected}
					aria-label='Add to playlist'
				>
					<ListPlus size={20} />
				</button>
				<div className='flex items-center space-x-2'>
					<button
						onClick={toggleMute}
						disabled={!isTrackSelected}
						className={`${
							isTrackSelected
								? 'text-gray-400 hover:text-white cursor-pointer transition-colors p-2 rounded-full hover:bg-[#2A2730]'
								: 'text-gray-600 cursor-pointer p-2'
						}`}
						aria-label={isMuted ? 'Unmute' : 'Mute'}
					>
						{volume === 0 || isMuted ? (
							<VolumeX size={20} />
						) : (
							<Volume2 size={20} />
						)}
					</button>
					<div className='relative w-20 h-5 flex items-center group'>
						<input
							type='range'
							min='0'
							disabled={!isTrackSelected}
							max='1'
							step='0.01'
							value={volume}
							onChange={handleVolumeChange}
							className='absolute w-full h-5 opacity-0 cursor-pointer z-10'
						/>
						<div
							className={`absolute w-full h-1 bg-gray-700 rounded-full overflow-hidden transition-all duration-200 group-hover:h-1.5`}
						>
							<div
								className={`${
									isTrackSelected
										? 'h-full bg-gradient-to-r from-indigo-600 to-violet-500'
										: 'bg-gray-600'
								}`}
								style={{ width: `${volume * 100}%` }}
							></div>
						</div>
						<div
							className={`absolute h-3 w-3 rounded-full ${
								isDark ? 'bg-white' : 'bg-[#e5e7eb]'
							} shadow-md opacity-0 group-hover:opacity-100 transition-all`}
							style={{
								left: `calc(${volume * 100}% - 6px)`,
								boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
							}}
						></div>
					</div>
				</div>
			</div>

			{isTrackInfoOpen && isTrackSelected && (
				<TrackInfo
					track={currentTrack!}
					onClose={() => setIsTrackInfoOpen(false)}
				/>
			)}

			{isPlaylistSelectorOpen && isTrackSelected && (
				<PlaylistSelector
					track={currentTrack!}
					onClose={() => setIsPlaylistSelectorOpen(false)}
					onAddToPlaylist={handleAddToPlaylist}
				/>
			)}
		</div>
	)
}
