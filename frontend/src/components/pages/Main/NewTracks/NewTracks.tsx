import { CircleArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'
import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

import { NewTracksItem } from './NewTracksItem'
import { NewTracksSkeleton } from './Skeleton/NewTracksSkeleton'

import type { NewTracksProps } from './types'

export const NewTracks: React.FC<NewTracksProps> = ({ tracks }) => {
	const navigate = useNavigate()
	const { isDark } = useTheme()

	const { showError } = useNotifications()

	const [isLoading, setIsLoading] = useState(true)

	const [newTracks, setNewTracks] = useState<any[]>([])

	const [skeletonCount, setSkeletonCount] = useState(6)

	useEffect(() => {
		const fetchNewTracks = async () => {
			const startTime = Date.now()
			try {
				const response = await fetch('http://localhost:8080/main', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
				if (!response.ok) {
					const errorText = await response.text()
					showError('Ошибка получения новых треков', errorText)
					return
				}
				const data = await response.json()
				if (!data) {
					showError(
						'Ошибка получения новых треков',
						'Не удалось получить новые треки'
					)
					return
				}
				setNewTracks(data.tracks?.newTracks || [])
			} catch (error) {
				showError('Ошибка получения новых треков', error)
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
		fetchNewTracks()
	}, [])

	return (
		<div
			className={`w-full h-auto ${
				isDark ? 'bg-[#24232B]' : 'bg-[#E5E7EB]'
			} rounded-xl p-8`}
		>
			<div className='flex items-center justify-between'>
				<h2
					className={`text-2xl font-bold ${
						isDark ? 'text-white' : 'text-black'
					} mb-6`}
				>
					Новые треки
				</h2>
				<CircleArrowRight
					data-tooltip-id='more-new-tracks'
					data-tooltip-content='Больше'
					size={30}
					onClick={() => {
						navigate('/tracks')
					}}
					className={`${
						isDark ? 'text-primary-GRAY' : 'text-black'
					} hover:scale-105 cursor-pointer mr-4 mt-[-20px] transition-transform duration-200`}
				/>
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4'>
				{isLoading ? (
					Array.from({ length: skeletonCount }, (_, index) => (
						<NewTracksSkeleton key={index} />
					))
				) : newTracks.length > 0 ? (
					newTracks.map((track, index) => (
						<NewTracksItem key={index} track={track} index={index} />
					))
				) : (
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
				)}
			</div>
			<Tooltip
				id='more-new-tracks'
				place='top'
				noArrow
				className='!bg-[#24232B] !text-white absolute !rounded-md !font-semibold !transition-none shadow-lg !animation-none'
			/>
		</div>
	)
}
