import { useLocation, useNavigate } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'

import { useAuth } from '../../../utils/Auth/hooks/useAuth'
import { navItems } from '../navData'

import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const PrimaryNav = () => {
	const { isDark } = useTheme()
	const navigate = useNavigate()
	const location = useLocation()

	const { showError } = useNotifications()
	const { isUserAuthenticated } = useAuth()

	return (
		<div className='mt-16 mb-12 flex flex-col gap-2'>
			{navItems.map(item => {
				const isActive = location.pathname === item.path
				return (
					<button
						key={item.name}
						type='button'
						onClick={() => {
							if (item.path && isUserAuthenticated) {
								navigate(item.path)
							} else {
								showError(
									'Ошибка авторизации',
									'Вы не авторизованы для доступа к этой странице'
								)
							}
						}}
						className={`group text-left`}
						data-tooltip-id='my-tooltipp'
						data-tooltip-content={item.name}
						aria-current={isActive ? 'page' : undefined}
					>
						<div
							className={`px-5 ${
								isDark ? 'text-gray-300' : 'text-black'
							} py-3 flex items-center justify-center rounded-md transition-colors cursor-pointer duration-200 ${
								isActive
									? 'bg-purple-600 text-white shadow-lg'
									: 'hover:bg-[#2A2730] hover:text-white'
							}`}
						>
							{item.icon}
						</div>
					</button>
				)
			})}

			<Tooltip
				id='my-tooltipp'
				place='left'
				noArrow
				className='!bg-[#24232B] !text-white !rounded-md !font-semibold !transition-none !animation-none shadow-lg'
			/>
		</div>
	)
}
