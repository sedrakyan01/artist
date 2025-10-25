import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Playlist {
	name: string
	owner: string
	status: string
	tracks: number
}

const defaultImage = 'https://misc.scdn.co/liked-songs/liked-songs-640.png'

import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

import type { PlaylistsProps } from './types'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import { PlaylistsSkeleton } from './Skeleton/PlaylistsSkeleton'

export const MyPlaylists: React.FC<PlaylistsProps> = () => {
	const { showError } = useNotifications()
	const navigate = useNavigate()

	const [playlistData, setPlaylistData] = useState<Playlist[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const handlePlaylistClick = (index: number, playlist: Playlist) => {
		navigate(`/playlist/${index}`, { state: { playlist } })
	}

	const [skeletonCount, setSkeletonCount] = useState(6) // eslint-disable-line
	const { isDark } = useTheme()

	useEffect(() => {
		const startTime = Date.now()
		try {
			const getPlaylistsData = async () => {
				const response = await fetch('http://localhost:8080/getuserplaylists', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
					},
					credentials: 'include',
				})
				if (!response.ok) {
					showError('Ошибка при получении данных пользователя.')
					return
				}
				const data = await response.json()
				if (Array.isArray(data)) {
					setPlaylistData(data)
				} else {
					setPlaylistData([])
				}
			}
			getPlaylistsData()
		} catch (error) {
			showError('Ошибка получения плейлистов', error)
		} finally {
			const elapsedTime = Date.now() - startTime
			const minLoadingTime = 500
			const remainingTime = minLoadingTime - elapsedTime

			if (remainingTime > 0) {
				setTimeout(() => {
					setIsLoading(false)
				}, remainingTime)
			} else {
				setIsLoading(false)
			}
		}
	}, []) // eslint-disable-line

	return (
		<div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mt-5'>
			{isLoading ? (
				Array.from({ length: skeletonCount }, (_, index) => (
					<PlaylistsSkeleton key={index} />
				))
			) : playlistData.length > 0 ? (
				playlistData.map((playlist, index) => (
					<div
						key={index}
						role='button'
						onClick={() => handlePlaylistClick(index, playlist)}
						className='group flex justify-center flex-col cursor-pointer bg-[#2a2831] p-4 rounded-lg transition-all duration-300 shadow-lg'
					>
						<div className='relative mb-4 overflow-hidden rounded-md shadow-xl'>
							<img
								src={defaultImage}
								alt={playlist.name}
								className='w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105'
							/>
							<div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
						</div>
						<div>
							<p className='mb-1 text-base font-semibold text-white line-clamp-2'>
								{playlist?.name
									? playlist.name[0].toUpperCase() + playlist.name.slice(1)
									: 'Без названия'}
							</p>
							<p className='text-[13px] w-[99%] truncate text-zinc-400 line-clamp-2'>
								{playlist?.status === 'private' ? 'Приватный' : 'Публичный'} •{' '}
								{playlist?.owner
									? playlist.owner[0].toUpperCase() + playlist.owner.slice(1)
									: 'Неизвестен'}{' '}
								•{' '}
								<span>
									{(playlist?.tracks || 0) > 1
										? `${playlist.tracks} треков`
										: (playlist?.tracks || 0) === 1
										? '1 трек'
										: 'Нет треков'}
								</span>
							</p>
						</div>
					</div>
				))
			) : (
				<div
					className={`col-span-full text-center ${
						isDark ? 'text-white' : 'text-black'
					} text-2xl mt-12 mb-10 font-semibold`}
				>
					<p>
						Ничего не найдено
						<br />
						<span className='text-purple-500 cursor-pointer'>
							создайте
						</span>{' '}
						свой первый плейлист
					</p>
				</div>
			)}
		</div>
	)
}
