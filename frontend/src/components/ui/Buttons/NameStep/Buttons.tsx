import { MouseEvent } from 'react'
import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const BackButton = ({ onBack, isLoading = false, disabled = false }) => {

	const { isDark } = useTheme()

	return (
		<button
			onClick={onBack}
			className={`w-[320px] ${isDark ? "bg-transparent" : "bg-transparent text-black"} border-2 ${
				isLoading || disabled
					? 'opacity-50 cursor-not-allowed'
					: 'hover:opacity-90'
			} mt-2 cursor-pointer rounded-3xl p-3 font-semibold ssm:w-[270px] m-auto button transition-opacity duration-300`}
		>
			Назад
		</button>
	)
}

export const NextButton = ({
	isLoading,
	onNext,
	formData,
	setFormData,
	isUserNameEmpty,
	isFirstNameEmpty,
	isArtistNameEmpty,
	setIsUserNameEmpty,
	setIsFirstNameEmpty,
	setIsArtistNameEmpty,
}) => {
	const { showError } = useNotifications()

	const capitalizeFirstLetter = (str: string): string => {
		if (!str) return str
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
	}

	const validateForm = (): boolean => {
		const emptyUserName = !formData.userName || formData.userName.trim() === ''
		const emptyFirstName =
			!formData.firstName || formData.firstName.trim() === ''
		const emptyArtistName =
			!formData.artistName || formData.artistName.trim() === ''

		setIsUserNameEmpty(emptyUserName)
		setIsFirstNameEmpty(emptyFirstName)
		setIsArtistNameEmpty(emptyArtistName)

		if (
			emptyUserName ||
			formData.userName.trim().length < 3 ||
			emptyFirstName ||
			formData.firstName.trim().length < 3 ||
			emptyArtistName ||
			formData.artistName.trim().length < 3
		) {
			showError(
				'Ошибка при проверке данных',
				'Пожалуйста, попробуйте проверить введённые данные на корректность.'
			)
			return false
		}

		if (
			formData.userName.trim().length > 15 ||
			formData.firstName.trim().length > 15 ||
			formData.artistName.trim().length > 15
		) {
			showError(
				'Ошибка при проверке данных',
				'Пожалуйста, укажите значение меньше 15 символов.'
			)
			return false
		}

		return true
	}

	const handleNext = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		const isValid = validateForm()

		if (isValid) {
			const capitalizedData = {
				...formData,
				userName: formData.userName.trim().toLowerCase(),
				firstName: capitalizeFirstLetter(formData.firstName.trim()),
				artistName: capitalizeFirstLetter(formData.artistName.trim()),
			}

			setFormData(capitalizedData)
			onNext()
		}
	}

	return (
		<button
			onClick={handleNext}
			disabled={
				isUserNameEmpty || isFirstNameEmpty || isArtistNameEmpty || isLoading
			}
			className={`w-[320px] bg-gradient-to-r from-purple-500 to-indigo-600 ${
				isLoading || isUserNameEmpty || isFirstNameEmpty || isArtistNameEmpty
					? 'opacity-50 cursor-not-allowed'
					: 'hover:opacity-90'
			} cursor-pointer mt-2 rounded-3xl p-3 font-semibold ssm:w-[270px] m-auto button transition-opacity duration-300`}
		>
			{isLoading ? 'Загрузка...' : 'Продолжить'}
		</button>
	)
}
