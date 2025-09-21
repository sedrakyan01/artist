import { MouseEvent, useState } from 'react'
import { useNotifications } from '../../../utils/Notification/hooks/useNotification'
import { API_ENDPOINTS } from '../api'
import type { ButtonProps } from '../types'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const BackButton: React.FC<ButtonProps> = ({
	onBack,
	isLoading = false,
	disabled = false,
}) => {
	const handleBackClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (!disabled && !isLoading) {
			onBack()
		}
	}

	const { isDark } = useTheme()

	return (
		<button
			onClick={handleBackClick}
			className={`w-[320px] ${
				isDark ? 'bg-transparent' : 'bg-transparent text-black'
			} border-2 ${
				isLoading || disabled
					? 'opacity-50 cursor-not-allowed'
					: 'hover:opacity-90'
			} mt-2 cursor-pointer rounded-3xl p-3 font-semibold ssm:w-[270px] m-auto button transition-opacity duration-300`}
			disabled={isLoading || disabled}
		>
			Назад
		</button>
	)
}

export const NextButton: React.FC<ButtonProps> = ({
	onNext,
	code,
	formData,
	setFormData,
}) => {
	const { showError } = useNotifications()

	const [isLoading, setIsLoading] = useState<boolean>(false)

	const validateCode = (code: string): boolean => {
		return code.trim().length > 0
	}

	const handleNextClick = async (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (isLoading) return
		setIsLoading(true)

		if (!code) {
			showError('Код не может быть пустым.')
			setCodeTouched(true)
			setIsLoading(false)
			return
		}

		if (!validateCode(code)) {
			showError('Пожалуйста, введите корректный код.')
			setCodeTouched(true)
			setIsLoading(false)
			return
		}

		try {
			const response = await fetch(
				API_ENDPOINTS.VERIFY_CODE(formData.email, code),
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				}
			)

			if (!response.ok) {
				const errorText = await response.text()
				showError(errorText || 'Ошибка при проверке кода.')
				setIsLoading(false)
				return
			}

			const data = await response.text()

			if (data === 'false') {
				showError('Неверный код подтверждения.')
				setIsLoading(false)
			} else if (data && data !== 'false') {
				setFormData({ ...formData, hash: data })
				onNext()
			} else {
				showError('Неожиданный ответ от сервера.')
				setIsLoading(false)
			}
		} catch (error: unknown) {
			showError(
				error instanceof Error ? error.message : 'Ошибка при проверке кода.'
			)
			setIsLoading(false)
		}
	}
	return (
		<button
			onClick={handleNextClick}
			className={`w-[320px] bg-gradient-to-r from-purple-500 to-indigo-600 ${
				isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
			} cursor-pointer mt-2 rounded-3xl p-3 font-semibold ssm:w-[270px] m-auto button transition-opacity duration-300`}
			disabled={!code || isLoading}
		>
			{isLoading ? 'Загрузка...' : 'Подтвердить'}
		</button>
	)
}
