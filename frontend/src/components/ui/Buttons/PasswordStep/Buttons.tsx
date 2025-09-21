import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const BackButton = ({ onBack, isLoading = false, disabled = false }) => {
	const { isDark } = useTheme()
	return (
		<button
			onClick={onBack}
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

export const NextButton = ({ handleNext, formData, isLoading = false }) => {
	return (
		<button
			onClick={handleNext}
			className={`w-[320px] bg-gradient-to-r from-purple-500 to-indigo-600 ${
				isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
			} cursor-pointer mt-2 rounded-3xl p-3 font-semibold ssm:w-[270px] m-auto button transition-opacity duration-300`}
			disabled={isLoading || !formData.password}
		>
			{isLoading ? 'Загрузка...' : 'Создать'}
		</button>
	)
}
