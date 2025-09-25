import React from 'react'
import type { Track } from './types'

import { TrackItem } from './TrackItem'

import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import { useState } from 'react'
import { TrackItemSkeleton } from './Skeleton/TrackItemSkeleton'

export const UserTracks = () => {
	const [tracks, setTracks] = React.useState<Track[]>([])

	const [isLoading, setIsLoading] = useState(true)
	const [skeletonCount, setSkeletonCount] = useState(20)

	const { showError } = useNotifications()

	const { isDark } = useTheme()

	const fetchTracks = async () => {
		const startTime = Date.now()

		try {
			const response = await fetch(
				'http://localhost:8080/getUserTracks?start=0&end=20',
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
					},
					credentials: 'include',
				}
			)

			if (!response.ok) {
				const errorText = await response.text()
				showError(errorText || 'Ошибка получения треков')
				return
			}

			const data = await response.json()
			if (data.length === 0) {
				setIsLoading(false)
			}
			setTracks(data || [])
			setSkeletonCount(data?.length || 20)
		} catch (error) {
			showError('Ошибка получения треков', error)
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

	React.useEffect(() => {
		fetchTracks()
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div
			className={`w-full h-auto mb-20 ${
				isDark ? 'bg-[#24232B]' : 'bg-[#E5E7EB]'
			} border-none rounded-2xl shadow-xl overflow-hidden p-8 font-sans transform transition-all duration-300 hover:shadow-2xl`}
			style={{ marginBottom: '750px' }}
		>
			<h1
				className={`text-2xl font-bold mb-6 ${
					isDark ? 'text-white' : 'text-black'
				}`}
			>
				Мои треки
			</h1>{' '}
			{isLoading ? (
				Array.from({ length: skeletonCount }, (_, index) => (
					<TrackItemSkeleton key={index} />
				))
			) : tracks.length > 0 ? (
				tracks.map((track, index) => (
					<TrackItem key={index} track={track} index={index} />
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
			) : null}
		</div>
	)
}
