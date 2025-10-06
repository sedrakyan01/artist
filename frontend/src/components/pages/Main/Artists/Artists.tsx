import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import { CircleArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'
import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

import { fetchArtists } from '../../../utils/Fetch/FetchArtists/FetchArtists'
import { ArtistItem } from './ArtistItem'
import { ArtistsSkeleton } from './Skeleton/ArtistsSkeleton'

export const Artists = () => {
	const { showError } = useNotifications()
	const [artist, setArtist] = useState([])
	const [loading, setLoading] = useState(true)
	const [skeletonCount, setSkeletonCount] = useState(5) // eslint-disable-line

	useEffect(() => {
		const getPopularArtists = async () => {
			const startTime = Date.now()
			try {
				const artists = await fetchArtists()
				setArtist(artists)
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
		const onTokenUpdated = () => getPopularArtists()
		const onArtistsUpdated = () => getPopularArtists()

		window.addEventListener('tokenUpdated', onTokenUpdated)
		window.addEventListener('artistsUpdated', onArtistsUpdated)

		return () => {
			window.removeEventListener('tokenUpdated', onTokenUpdated)
			window.removeEventListener('artistsUpdated', onArtistsUpdated)
		}
	}, [showError])

	const { isDark } = useTheme()
	const navigate = useNavigate()

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
			<div className='flex justify-center gap-7'>
				{loading ? (
					Array.from({ length: skeletonCount }, (_, index) => (
						<ArtistsSkeleton key={index} />
					))
				) : artist.length > 0 ? (
					artist
						.slice(0, 5)
						.map((artist, index) => (
							<ArtistItem key={index} artist={artist} index={index} />
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
