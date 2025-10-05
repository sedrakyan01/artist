import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import { CircleArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'
import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

import { ArtistItem } from './ArtistItem'
import { ArtistsSkeleton } from './Skeleton/ArtistsSkeleton'

export const Artists = () => {
	const { showError } = useNotifications()
	const [artists, setArtists] = useState([])
	const [loading, setLoading] = useState(true)
	const [skeletonCount, setSkeletonCount] = useState(6) // eslint-disable-line

	useEffect(() => {
		const getPopularArtists = async () => {
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
					showError(
						errorText || 'Ошибка при получении популярных исполнителей.'
					)
					return
				}
				const data = await response.json()
				const artistsData = data.artists || []
				setArtists(artistsData)
			} catch (error) {
				showError('Ошибка получения популярных исполнителей:', error)
			} finally {
				const elapsedTime = Date.now() - startTime
				const minLoadingTime = 500
				const remainingTime = minLoadingTime - elapsedTime

				if (remainingTime > 0) {
					setTimeout(() => {
						setLoading(false)
					}, remainingTime)
				} else {
					setLoading(false)
				}
			}
		}
		getPopularArtists()
	}, [])

	const { isDark } = useTheme()
	const navigate = useNavigate()

	return (
		<div
			className={`w-full h-[250px] ${
				isDark ? 'bg-[#24232B]' : 'bg-[#E5E7EB]'
			} rounded-xl p-8`}
		>
			<div className='flex items-center justify-between'>
				<h2
					className={`text-2xl font-bold ${
						isDark ? 'text-white' : 'text-black'
					} mb-6`}
				>
					Популярные исполнители
				</h2>
				<CircleArrowRight
					data-tooltip-id='more-new-tracks'
					data-tooltip-content='Больше'
					size={30}
					onClick={() => {
						navigate('/leaderboard')
					}}
					className={`${
						isDark ? 'text-primary-GRAY' : 'text-black'
					} hover:scale-105 cursor-pointer mr-4 mt-[-20px] transition-transform duration-200`}
				/>
			</div>
			<div>
				{loading ? (
					Array.from({ length: skeletonCount }, (_, index) => (
						<ArtistsSkeleton key={index} />
					))
				) : artists.length > 0 ? (
					artists.map((artist, index) => (
						<ArtistItem key={index} artists={artists} index={index} />
					))
				) : (
					<div
						className={`text-center mx-auto ${
							isDark ? 'text-white' : 'text-black'
						} text-2xl mt-12 mb-10 font-semibold col-span-full grid place-items-center h-64`}
					>
						<p>
							Ничего не найдено
							<br />
							<span className='text-purple-500 cursor-pointer'>
								зарегистрируйте
							</span>{' '}
							пару исполнителей, чтобы они появились здесь!
						</p>
					</div>
				)}
			</div>
			<Tooltip
				id='more-popular-artists'
				place='top'
				noArrow
				className='!bg-[#24232B] !text-white absolute !rounded-md !font-semibold !transition-none shadow-lg !animation-none'
			/>
		</div>
	)
}
