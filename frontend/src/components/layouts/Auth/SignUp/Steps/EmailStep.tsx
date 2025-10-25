import { ChangeEvent, MouseEvent, useState } from 'react'
import type { EmailCheckResponse, EmailStepProps } from '../types'

import { useNotifications } from '../../../../utils/Notification/hooks/useNotification'

import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

export const EmailStep: React.FC<EmailStepProps> = ({
	onNext,
	formData,
	setFormData,
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const { showError, showInfo } = useNotifications()

	const { isDark } = useTheme()

	const validateEmail = (email: string): boolean => {
		const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
		return re.test(email)
	}

	const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		const email = e.target.value
		setFormData({ ...formData, email })
	}

	const handleNextClick = async (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (isLoading) return
		setIsLoading(true)

		const email = formData.email
		if (!email) {
			showError('Ошибка', 'Введите корректную почту пользователя.')
			setIsLoading(false)
			return
		}
		if (!validateEmail(email)) {
			showError('Ошибка', 'Пожалуйста, введите корректную почту пользователя.')
			setIsLoading(false)
			return
		}

		try {
			const response = await fetch(
				`http://localhost:8080/emailchecksend?email=${encodeURIComponent(
					email
				)}`,
				{
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
				}
			)

			if (!response.ok) {
				const errorText = await response.text()
				showError('Ошибка', errorText || 'Ошибка при проверке email.')
				setIsLoading(false)
				return
			}

			const data: EmailCheckResponse = await response.json()

			if (data.exists === true || data.exists === 'true') {
				showError('Ошибка', 'Данная почта пользователя уже используется.')
				setIsLoading(false)
			} else if (data.exists === 'registration code has been send') {
				onNext()
				showInfo('Информация', 'Код подтверждения отправлен на вашу почту.')
			} else {
				showError('Ошибка', 'Ой-ой, Неожиданный ответ от сервера.')
				setIsLoading(false)
			}
		} catch (error: unknown) {
			showError(
				error instanceof Error ? error.message : 'Ошибка при проверке email.'
			)
			setIsLoading(false)
		}
	}

	return (
		<div>
			<div className='flex justify-center flex-col'>
				<label className={`block ${isDark ? "text-white" : "text-gray-700"} text-sm font-medium mb-1`}>
					Электронная почта
				</label>
				<input
					type='email'
					value={formData.email}
					onChange={handleEmailChange}
					placeholder='name@domain.org'
					className={`${isDark ? "bg-[#33313B]" : "bg-[#e5e7eb] text-black"} pt-2 pb-2 pl-4 pr-2 rounded m-auto w-full h-[55px] mb-2 placeholder-[#7C7C7C] ssm:w-[270px] mt-2 outline-none hover:ring-2 hover:ring-purple-600 focus:ring-2 focus:ring-purple-600 transition-all duration-300`}
					disabled={isLoading}
				/>
			</div>

			<button
				onClick={handleNextClick}
				className={`w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 ${
					isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
				} cursor-pointer rounded-2xl p-3 font-semibold ssm:w-[270px] m-auto button transition-opacity duration-300`}
				disabled={!formData.email || isLoading}
			>
				{isLoading ? 'Проверка...' : 'Продолжить'}
			</button>

			<p className={`text-sm ${isDark ? "text-[#7C7C7C]" : "text-black"} mt-5 text-center`}>
				Продолжая, вы соглашаетесь с нашими{' '}
				<span className={`font-semibold ${isDark ? "text-purple-400" : "text-purple-600"} cursor-pointer hover:underline`}>
					Условиями обслуживания{' '}
				</span>
				<span className={`${isDark ? "text-purple-400" : "text-purple-600"} font-semibold`}>и </span>
				<span className={`font-semibold ${isDark ? "text-purple-400" : "text-purple-600"} cursor-pointer hover:underline`}>
					Политикой конфиденциальности.
				</span>
			</p>
		</div>
	)
}
