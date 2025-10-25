import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useNotifications } from '../../utils/Notification/hooks/useNotification'
import { useTheme } from '../../utils/Theme/hooks/useTheme'

import { Header } from '../../layouts/Header/Header'
import { SideBar } from '../../layouts/SideBar/SideBar'

import { PlaylistsTrackItem } from './tracks/PlaylistsTrackItem'

import { Undo2 } from 'lucide-react'

import { PlaylistItemSkeleton } from './tracks/skeleton/PlaylistsTrackSkeleton'

import type { PlaylistDetails, Track } from './types'

export const PlaylistPage = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const { isDark } = useTheme()

	const handleGoBack = () => {
		navigate('/playlists')
	}
	const [playlistDetails, setPlaylistDetails] =
		useState<PlaylistDetails | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [playlistData, setPlaylistData] = useState<_any[]>([])
	const { showError, showSuccess } = useNotifications()
	const [tracks, setTracks] = useState<Track[]>([])

	useEffect(() => {
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
				console.log('Полученные плейлисты:', data)
				if (Array.isArray(data)) {
					setPlaylistData(data)
				} else {
					setPlaylistData([])
				}
			}
			getPlaylistsData()
		} catch (error) {
			showError('Ошибка получения плейлистов', error)
		}
	}, []) // eslint-disable-line

	const currentPlaylist = playlistData[Number(id)]
	const playlistName = currentPlaylist?.name || ''

	useEffect(() => {
		if (!playlistData.length) {
			console.log('Ожидание данных плейлистов...')
			return
		}

		const currentPlaylist = playlistData[Number(id)]
		if (!currentPlaylist) {
			console.log('Плейлист не найден по индексу:', id)
			return
		}

		console.log('Текущий плейлист:', currentPlaylist)

		const fetchPlaylistDetails = async () => {
			const startTime = Date.now()
			try {
				const response = await fetch(
					`http://localhost:8080/gettracksfromplaylist?playlistName=${encodeURIComponent(
						playlistName
					)}&start=0&end=-1`,
					{
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
						},
						credentials: 'include',
					}
				)

				if (!response.ok) {
					alert('Ошибка при получении данных плейлиста')
					return
				}

				const tracks = await response.json()
				console.log('Полученные треки:', tracks)
				if (!Array.isArray(tracks)) {
					console.log(
						'Внимание: данные треков отсутствуют или имеют неправильный формат',
						tracks
					)
				}
				setTracks(tracks)
				setPlaylistDetails({
					name: playlistData[Number(id)]?.name || 'Неизвестный плейлист',
					owner: playlistData[Number(id)]?.owner || 'Неизвестный',
					status: playlistData[Number(id)]?.status || 'public',
					tracks: tracks || [],
				})
			} catch (error) {
				alert(error, 'Ошибка при загрузке плейлиста')
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
		}

		fetchPlaylistDetails()
	}, [id, playlistData]) // eslint-disable-line

	const handleChangeStatus = async () => {
		if (!playlistDetails?.owner) {
			showError('Не удалось изменить статус плейлиста')
			return
		}

		try {
			const token = localStorage.getItem('accessToken')
			if (!token) throw new Error('No access token found')

			const response = await fetch(
				`http://localhost:8080/playlistchangestatus?playlistName=${encodeURIComponent(
					playlistDetails.name
				)}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					credentials: 'include',
				}
			)

			if (!response.ok) {
				const errorText = await response.text()
				showError(errorText || 'Ошибка при изменении статуса плейлиста')
				return
			}

			setPlaylistDetails(prev =>
				prev
					? {
							...prev,
							status: prev.status === 'public' ? 'private' : 'public',
					  }
					: prev
			)

			showSuccess('Статус плейлиста изменён')
		} catch (error) {
			showError('Ошибка при изменении статуса плейлиста', error)
		}
	}

	return (
		<div
			className={`text-white mt-30 flex ${
				isDark ? 'bg-[#18161C]' : 'bg-[#FFF]'
			}`}
		>
			<div className='z-[50]'>
				<SideBar />
			</div>

			<div className='flex-1 ml-[80px] px-8 space-y-8'>
				<Header />
				<div className='flex justify-center'>
					<div className='flex flex-col gap-4 w-full'>
						<div
							className={`w-full h-auto mb-20 ${
								isDark ? 'bg-[#24232B]' : 'bg-[#E5E7EB]'
							} border-none rounded-2xl shadow-xl overflow-hidden p-8 font-sans transform transition-all duration-300 hover:shadow-2xl`}
							style={{ marginBottom: '120px' }}
						>
							<div className='flex justify-between items-center gap-4'>
								<div className='flex items-center gap-4'>
									<Undo2
										size={32}
										className='text-purple-600 cursor-pointer hover:text-purple-700 transition-colors duration-200'
										onClick={handleGoBack}
									/>
									{isLoading ? (
										<div
											className={`w-60 h-8 ${
												isDark ? 'bg-[#36343F]' : 'bg-[#E5E7EB]'
											} rounded`}
										></div>
									) : (
										<h1 className='text-2xl font-bold'>
											Плейлист -{' '}
											{playlistDetails?.name[0].toUpperCase() +
												playlistDetails?.name.slice(1)}
										</h1>
									)}
								</div>
								<div>
									<button
										onClick={handleChangeStatus}
										className='bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200 transform shadow-lg cursor-pointer'
									>
										Изменить статус на{' '}
										{playlistDetails?.status === 'public'
											? 'приватный'
											: 'публичный'}
									</button>
								</div>
							</div>
							{isLoading ? (
								Array.from({ length: 3 }, (_, index) => (
									<PlaylistItemSkeleton key={index} />
								))
							) : tracks.length > 0 ? (
								tracks.map((track, index) => (
									<PlaylistsTrackItem
										key={index}
										track={track}
										index={index}
										trackList={tracks}
									/>
								))
							) : tracks.length === 0 ? (
								<div
									className={`text-center ${
										isDark ? 'text-white' : 'text-black'
									} text-2xl mt-12 mb-10 font-semibold`}
								>
									<p>
										Ничего не найдено
										<br />
										<span className='text-purple-500 cursor-pointer'>
											загрузите
										</span>{' '}
										свой первый трек
									</p>
								</div>
							) : (
								<PlaylistItemSkeleton />
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
