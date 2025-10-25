import { Check, Plus, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import type { Playlist, PlaylistSelectorProps } from './types'

import { useTheme } from '../../utils/Theme/hooks/useTheme'

export const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({
	track,
	onClose,
}) => {
	const [playlists, setPlaylists] = useState<Playlist[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)
	const [successPlaylist, setSuccessPlaylist] = useState<string | null>(null)
	const [newPlaylistName, setNewPlaylistName] = useState('')
	const [isCreating, setIsCreating] = useState(false)
	const modalRef = useRef<HTMLDivElement>(null)
	const { isDark } = useTheme()

	useEffect(() => {
		const loadPlaylists = async () => {
			setIsLoading(true)
			const startTime = Date.now()
			try {
				const token = localStorage.getItem('accessToken')
				const response = await fetch('http://localhost:8080/getuserplaylists', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					credentials: 'include',
				})
				if (!response.ok) throw new Error('Failed to load playlists')
				const data = await response.json()
				const playlistsData: Playlist[] = Array.isArray(data)
					? data.map((item: _any) =>
							typeof item === 'string' ? { name: item } : item
					  )
					: []

				const playlistsWithCounts = await Promise.all(
					playlistsData.map(async (playlist: Playlist) => {
						const playlistName = playlist.name
						let totalTracks = 0
						let start = 0
						const limit = 20
						while (true) {
							try {
								const tracksResponse = await fetch(
									`http://localhost:8080/gettracksfromplaylist?playlistName=${encodeURIComponent(
										playlistName
									)}&start=${start}&end=${start + limit}`,
									{
										method: 'GET',
										headers: {
											'Content-Type': 'application/json',
											Authorization: `Bearer ${token}`,
										},
										credentials: 'include',
									}
								)
								if (!tracksResponse.ok) break
								const tracksData = await tracksResponse.json()
								const tracks = Array.isArray(tracksData)
									? tracksData
									: tracksData.tracks || []
								totalTracks += tracks.length
								if (tracks.length < limit) break
								start += limit
							} catch (error) {
								console.error('Failed to fetch tracks:', error)
								break
							}
						}
						return {
							...playlist,
							tracksCount: totalTracks,
						}
					})
				)
				setPlaylists(playlistsWithCounts)
			} catch (error) {
				console.error('Failed to load playlists:', error)
			} finally {
				const elapsedTime = Date.now() - startTime
				const minLoadingTime = 800
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
		loadPlaylists()
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [onClose])

	const handleCreateAndAddToPlaylist = async () => {
		if (!newPlaylistName.trim()) return

		setIsCreating(true)
		try {
			const token = localStorage.getItem('accessToken')
			if (!token) throw new Error('No access token found')

			const url = `http://localhost:8080/addtoplaylist?trackID=${
				track.track_id
			}&playlistName=${encodeURIComponent(newPlaylistName.trim())}`

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
			})

			if (!response.ok) {
				throw new Error('Failed to create playlist')
			}

			setSuccessPlaylist(newPlaylistName)
			const updatedPlaylists = [
				...playlists,
				{ name: newPlaylistName, tracksCount: 1 },
			]
			setPlaylists(updatedPlaylists)
			setNewPlaylistName('')
		} catch (error) {
			console.error('Failed to create playlist:', error)
		} finally {
			setIsCreating(false)
		}
	}

	const handleAddToPlaylist = async (playlistId: string) => {
		setAddingToPlaylist(playlistId)
		try {
			const token = localStorage.getItem('accessToken')
			if (!token) throw new Error('No access token found')
			const url = `http://localhost:8080/addtoplaylist?trackID=${
				track.track_id
			}&playlistName=${encodeURIComponent(playlistId)}`
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
			})
			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(
					`Failed to add track to playlist: ${response.status} ${errorText}`
				)
			}
			setSuccessPlaylist(playlistId)
		} catch (error) {
			console.error('Failed to add to playlist:', error)
		} finally {
			setAddingToPlaylist(null)
		}
	}

	return (
		<div className='absolute bottom-24 right-4'>
			<div
				ref={modalRef}
				className={`${
					isDark ? 'bg-[#24232B]' : 'bg-[#E5E7EB]'
				} border border-[#2A293F] rounded-lg shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden`}
			>
				<div className='p-4 border-b border-[#2A293F] flex items-center justify-between'>
					<div>
						<h3
							className={`${
								isDark ? 'text-white' : 'text-black'
							} font-semibold text-lg`}
						>
							Добавить в плейлист
						</h3>
					</div>
					<button
						onClick={onClose}
						className={`text-gray-400 ${
							isDark ? 'hover:text-white' : 'hover:text-black'
						} rounded-full transition-colors cursor-pointer`}
					>
						<X size={20} />
					</button>
				</div>

				<div className='p-4 border-b border-[#2A293F]'>
					<div className='flex gap-2'>
						<input
							type='text'
							value={newPlaylistName}
							onChange={e => setNewPlaylistName(e.target.value)}
							placeholder='Название нового плейлиста'
							className={`flex-1 ${
								isDark ? 'bg-[#2a2831] text-white' : 'bg-[#D5D7DA] text-black'
							} hover:ring-purple-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600`}
						/>
						<button
							onClick={handleCreateAndAddToPlaylist}
							disabled={isCreating || !newPlaylistName.trim()}
							className='px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer'
						>
							{isCreating ? (
								<>
									<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
									Создание...
								</>
							) : (
								<>
									<Plus size={16} />
									Создать
								</>
							)}
						</button>
					</div>
				</div>

				<div className='max-h-96 overflow-y-auto'>
					{isLoading ? (
						<div className='p-8 flex items-center justify-center'>
							<div className='w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin'></div>
							<span
								className={`ml-3 ${isDark ? 'text-gray-400' : 'text-black'}`}
							>
								Загрузка плейлистов...
							</span>
						</div>
					) : playlists.length === 0 ? (
						<div className='p-8 text-center text-gray-400'>
							<p>Плейлисты не найдены</p>
						</div>
					) : (
						<div className='p-2'>
							{playlists.map(playlist => {
								const key = playlist.id || playlist.name

								const count = playlist.totalTracks ?? playlist.tracksCount ?? 0

								return (
									<div
										key={key}
										className={`flex items-center justify-between p-3 ${
											isDark ? 'hover:bg-[#2a2831]' : 'hover:bg-[#d5d7da]'
										} cursor-pointer rounded-lg transition-colors group`}
									>
										<div className='flex items-center flex-1 min-w-0'>
											<div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3'>
												<Plus size={20} className='text-white' />
											</div>
											<div className='min-w-0 flex-1'>
												<div
													className={`${
														isDark ? 'text-white' : 'text-black'
													} font-medium truncate`}
												>
													{playlist.name}
												</div>
												<div className='text-gray-400 text-sm'>
													{count} треков
												</div>
											</div>
										</div>
										<button
											onClick={() => handleAddToPlaylist(key)}
											disabled={
												addingToPlaylist === key || successPlaylist === key
											}
											className='ml-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-green-600 text-white text-sm font-medium rounded transition-colors flex items-center cursor-pointer gap-2 min-w-[80px] justify-center'
										>
											{addingToPlaylist === key ? (
												<>
													<div className='w-4 h-4 border-2 border-white border-t-transparent rounded animate-spin'></div>
													Добавление
												</>
											) : successPlaylist === key ? (
												<>
													<Check size={16} />
													Добавлено
												</>
											) : (
												'Добавить'
											)}
										</button>
									</div>
								)
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
