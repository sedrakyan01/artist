import { useEffect, useState } from 'react'
import { useNotifications } from '../../../utils/Notification/hooks/useNotification'
import { ProfileCardSkeleton } from './Skeleton/ProfileCardSkeleton'

import type { UserData } from './types'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const ProfileCard = () => {
	const { showError } = useNotifications()
	const [userData, setUserData] = useState<UserData | null>(null)
	const [loading, setLoading] = useState(true)
	const [componentState, setComponentState] = useState({
		showCopyTooltip: false,
		copySuccess: false,
	})

	const { isDark } = useTheme()

	useEffect(() => {
		const fetchData = async () => {
			const startTime = Date.now()
			try {
				const response = await fetch('http://localhost:8080/getuserdatasend', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
					},
					credentials: 'include',
					body: JSON.stringify([
						'artistName',
						'firstName',
						'username',
						'plays',
					]),
				})

				if (!response.ok) {
					const errorText = await response.text()
					showError(errorText || 'Ошибка при получении данных пользователя.')
					return
				}

				const data = await response.json()
				setUserData({
					username: data[2],
					firstName: data[1],
					artistName: data[0],
					plays: data[3],
				})
			} catch (error) {
				showError('Ошибка получения данных пользователя', String(error))
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
		fetchData()
	}, [showError])

	const handleMouseEnter = () => {
		setComponentState(prev => ({
			...prev,
			showCopyTooltip: true,
			copySuccess: false,
		}))
	}

	const randomColors = ['#36343F', '#3a3841', '#24232B']

	const handleMouseLeave = () => {
		setTimeout(() => {
			setComponentState(prev => ({ ...prev, showCopyTooltip: false }))
		}, 1)
	}

	const handleCopyUsername = async () => {
		if (userData?.username) {
			try {
				await navigator.clipboard.writeText(userData.username)
				setComponentState(prev => ({ ...prev, copySuccess: true }))
				setTimeout(() => {
					setComponentState(prev => ({ ...prev, showCopyTooltip: false }))
				}, 1500)
			} catch (error) {
				console.error('Failed to copy username:', error)
			}
		}
	}

	if (loading) {
		return <ProfileCardSkeleton />
	}

	if (!userData) {
		return <ProfileCardSkeleton />
	}

	const statCards = [
		{ value: userData.plays?.toLocaleString() || '0', label: 'Прослушиваний' },
		{ value: '0', label: 'Подписчики' },
		{ value: '0', label: 'Подписки' },
		{ value: '0', label: 'Треки' },
	]

	return (
		<div className='border-none rounded-2xl shadow-xl overflow-hidden font-sans transform transition-all duration-300 hover:shadow-2xl'>
			<div className='relative h-48 bg-cover bg-center bg-gradient-to-br from-purple-500 to-indigo-600'>
				<div className='absolute bottom-0 w-full h-16'>
					<svg
						className='w-full h-full'
						viewBox='0 0 100 20'
						preserveAspectRatio='none'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M0 10 Q 25 0, 50 10 T 100 10'
							fill='none'
							stroke='rgba(255, 255, 255, 0.3)'
							strokeWidth='2'
						/>
						<path
							d='M0 15 Q 25 5, 50 15 T 100 15'
							fill='none'
							stroke='rgba(255, 255, 255, 0.3)'
							strokeWidth='2'
						/>
					</svg>
				</div>
			</div>

			<div
				className={`relative ${
					isDark ? 'bg-[#24232B] border-[#33313E]' : 'bg-[#E5E7EB] border-none'
				} border-t`}
			>
				<div className='absolute -top-16 left-8'>
					<div className='relative group'>
						<div
							className={`w-32 h-32 rounded-full border-4 ${
								isDark ? 'border-[#28262F]' : 'border-[#E5E7EB]'
							} overflow-hidden shadow-xl`}
						>
							<div className='w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center'>
								<span className='text-white cursor-pointer text-4xl font-bold z-40'>
									{userData.firstName?.charAt(0).toUpperCase() || 'U'}
								</span>
							</div>
						</div>
						<div
							className={`absolute inset-0 rounded-full bg-${
								randomColors[Math.floor(Math.random() * randomColors.length)]
							} bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 cursor-pointer`}
						></div>
					</div>
				</div>

				<div className='pt-20 pb-6 px-8 h-[288px]'>
					<div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-0'>
						<div className='flex-1'>
							<h1
								className={`${
									isDark ? 'text-white' : 'text-black'
								} text-3xl lg:text-4xl font-bold mb-2 tracking-tight`}
							>
								{userData.firstName || 'Пользователь'}
							</h1>

							<div className='relative inline-block'>
								<p
									className={`${
										isDark
											? 'text-gray-400 hover:text-gray-300'
											: 'text-gray-600 hover:text-gray-500'
									} text-lg mb-1 cursor-pointer transition-colors duration-200 select-none`}
									onMouseEnter={handleMouseEnter}
									onMouseLeave={handleMouseLeave}
									onClick={handleCopyUsername}
								>
									@{userData.username || 'username'}
								</p>

								{componentState.showCopyTooltip && (
									<div className='absolute top-full left-0 mt-1 px-3 py-2 bg-[#28262F] text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-10'>
										{componentState.copySuccess ? (
											<span className='text-green-400'>Скопировано!</span>
										) : (
											<span>Нажмите, чтобы скопировать</span>
										)}
									</div>
								)}
							</div>
						</div>

						<div className='flex flex-wrap gap-3 mt-2'>
							<button
								className={`${
									isDark
										? 'bg-[#36343F] text-white'
										: 'bg-[#d5d7da] text-black hover:text-white'
								} px-6 py-2.5 rounded-lg hover:bg-purple-600 transition-colors duration-300 shadow-md font-medium cursor-pointer`}
							>
								Поделиться
							</button>
							<button
								className={`${
									isDark
										? 'bg-[#36343F] cursor-pointer text-white'
										: 'bg-[#d5d7da] text-black hover:text-white'
								} px-6 py-2.5 rounded-lg hover:bg-purple-600 transition-colors duration-300 shadow-md font-medium cursor-pointer`}
							>
								Публичный профиль
							</button>
							<button className='bg-gradient-to-r from-purple-500 cursor-pointer to-indigo-600 text-white px-6 py-2.5 rounded-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform shadow-md font-medium'>
								Редактировать
							</button>
						</div>
					</div>

					<div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4'>
						{statCards.map((stat, index) => (
							<div
								key={index}
								className={`flex flex-col items-center px-4 py-4 rounded-xl ${
									isDark
										? 'bg-[#36343F] hover:bg-[#3a3841]'
										: 'bg-[#d5d7da] hover:bg-[#c9ccd2]'
								} transition-colors duration-200 cursor-pointer`}
							>
								<span
									className={`${
										isDark ? 'text-white' : 'text-black'
									} font-bold text-xl lg:text-2xl mb-1`}
								>
									{stat.value}
								</span>
								<span
									className={`${
										isDark ? 'text-gray-400' : 'text-gray-600'
									} text-sm font-semibold text-center`}
								>
									{stat.label}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
