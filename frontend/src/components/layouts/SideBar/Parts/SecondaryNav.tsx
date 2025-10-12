import { useLocation, useNavigate } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'

import { navItemsBottom } from '../navData'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import { useAuth } from '../../../utils/Auth/hooks/useAuth'
import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

export const SecondaryNav = () => {
	const { isDark } = useTheme()
	const navigate = useNavigate()
	const location = useLocation()

	const { showError } = useNotifications()
	const { isUserAuthenticated } = useAuth()

	return (
		<div className='mt-8 mb-12 flex flex-col gap-2'>
			{navItemsBottom.map(item => {
				const isActive = location.pathname === item.path
				return (
					<div
						key={item.name}
						className='group hover:cursor-pointer'
						data-tooltip-id='my-tooltipp'
						data-tooltip-content={item.name}
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
					>
						<div
							className={`
								px-5 py-3 flex items-center justify-center rounded-xl
								transition-all duration-300 cursor-pointer
								${
									isActive
										? 'bg-purple-600/40 text-white border border-white/30 shadow-[0_0px_32px_rgba(147,51,234,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
										: isDark
										? 'bg-black/20 text-gray-300 border border-white/10 hover:bg-black/30 hover:border-white/15 hover:-translate-y-0.5'
										: 'bg-white/10 text-gray-700 border border-white/15 hover:bg-white/15 hover:border-white/20 hover:-translate-y-0.5'
								}
								[backdrop-filter:blur(20px)_saturate(180%)]
								[-webkit-backdrop-filter:blur(20px)_saturate(180%)]
								shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]
								hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.15)]
								active:translate-y-0
							`}
						>
							{item.icon}
						</div>
					</div>
				)
			})}

			<Tooltip
				id='my-tooltipp'
				place='left'
				noArrow
				className='!bg-black/20 !text-white !rounded-md !font-semibold !transition-none !animation-none [backdrop-filter:blur(20px)_saturate(180%)] [-webkit-backdrop-filter:blur(20px)_saturate(180%)] shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-0'
			/>
		</div>
	)
}
