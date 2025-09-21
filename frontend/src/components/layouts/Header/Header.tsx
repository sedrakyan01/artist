import { Download, LogIn, Search } from 'lucide-react'

import { useNotifications } from '../../utils/Notification/hooks/useNotification'

import { AuthModal } from '../../layouts/Auth/AuthModal/AuthModal'

import { useModal } from '../../ui/Modal/hooks/useModal'
import { useAuth } from '../../utils/Auth/hooks/useAuth'

import { useTheme } from '../../utils/Theme/hooks/useTheme'

export const Header = () => {
	const { isUserAuthenticated } = useAuth()
	const { showInfo } = useNotifications()
	const authModal = useModal('authModal')

	const { isDark } = useTheme()

	return (
		<header className={`fixed px-2 top-0 left-[85px] right-0 w-full py-5 z-50 ${
			isDark ? 'bg-[#18161c]' : 'bg-white'
		} `}>
			<div className='container mx-auto px-4'>
				<div className='flex items-center justify-between gap-4'>
					<div className='flex gap-2 items-center flex-1'>
						<div className='relative flex-1 max-w-md'>
							<Search
								size={20}
								className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none'
							/>
							<input
								type='text'
								placeholder='Расширенный поиск...'
								className={`pl-10 ${
									isUserAuthenticated ? 'w-[1130px]' : 'w-[1000px]'
								} pr-4 py-3 ${
									isDark
										? 'bg-[#2A2730] placeholder-white'
										: 'bg-[#E5E7EB] placeholder-black text-black'
								} rounded-xl outline-none hover:transition-all duration-200 hover:ring-2 hover:ring-purple-600 focus:ring-2 focus:ring-purple-600 focus:bg-primary-BACKGROUND`}
							/>
						</div>
					</div>

					<div className='flex items-center gap-4 mr-23'>
						<button
							className='bg-purple-600 cursor-pointer hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200 transform shadow-lg'
							onClick={() => {
								showInfo(
									'Скоро!',
									'Скачивание приложения будет доступно в ближайшее время.'
								)
							}}
						>
							<Download size={18} />
							Установить приложение
						</button>

						{!isUserAuthenticated && (
							<button
								className='bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-medium text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 transform shadow-lg'
								onClick={authModal.openModal}
							>
								<LogIn size={18} />
								Войти
							</button>
						)}
					</div>
				</div>
			</div>
			<AuthModal
				isOpen={authModal.isOpen}
				onClose={authModal.closeModal}
				initialMode='login'
			/>
		</header>
	)
}