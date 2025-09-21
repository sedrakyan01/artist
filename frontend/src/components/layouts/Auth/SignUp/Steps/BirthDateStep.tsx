import { useState } from 'react'
import { countries } from '../../../../utils/Data/countries'

import { months } from '../../../../utils/Data/months'

import type { BirthDateStepProps, DateFields } from '../types'

import { useNotifications } from '../../../../utils/Notification/hooks/useNotification'

import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

import {
	BackButton,
	NextButton,
} from '../../../../ui/Buttons/BirthDateStep/Buttons'

export const BirthDateStep: React.FC<BirthDateStepProps> = ({
	onNext,
	onBack,
	formData,
	setFormData,
}) => {
	const [dateFields, setDateFields] = useState<DateFields>({
		day: '',
		month: '',
		year: '',
	})

	const { isDark } = useTheme()

	const { showError } = useNotifications()

	const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
	const [countrySearch, setCountrySearch] = useState('')

	const [isDayEmpty, setIsDayEmpty] = useState(false)
	const [isMonthEmpty, setIsMonthEmpty] = useState(false)
	const [isYearEmpty, setIsYearEmpty] = useState(false)
	const [isCountryEmpty, setIsCountryEmpty] = useState(false)

	const filteredCountries = countries.filter(country =>
		country.toLowerCase().includes(countrySearch.toLowerCase())
	)

	const validateDate = (day: string, month: string, year: string): boolean => {
		if (!day || !month || !year) return false
		const dayNum = parseInt(day)
		const monthNum = parseInt(month)
		const yearNum = parseInt(year)
		if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return false
		const currentYear = new Date().getFullYear()
		if (yearNum < 1900 || yearNum > currentYear) return false
		if (monthNum < 1 || monthNum > 12) return false
		const daysInMonth = new Date(yearNum, monthNum, 0).getDate()
		return dayNum >= 1 && dayNum <= daysInMonth
	}

	const validateForm = (): string[] => {
		const errors: string[] = []

		const emptyDay = !dateFields.day
		const emptyMonth = !dateFields.month
		const emptyYear = !dateFields.year
		const emptyCountry = !formData.country

		setIsDayEmpty(emptyDay)
		setIsMonthEmpty(emptyMonth)
		setIsYearEmpty(emptyYear)
		setIsCountryEmpty(emptyCountry)

		if (!validateDate(dateFields.day, dateFields.month, dateFields.year)) {
			errors.push('Пожалуйста, введите корректную дату рождения')
		}
		if (emptyCountry) {
			errors.push('Пожалуйста, выберите вашу страну проживания')
		}

		return errors
	}

	const handleDateChange = (field: keyof DateFields, value: string) => {
		if (field === 'day' && value.length > 2) return
		if (field === 'year' && value.length > 4) return
		if (field !== 'month' && value && !/^\d+$/.test(value)) return
		if (field === 'day' && parseInt(value) > 31) value = '31'

		const newDateFields = { ...dateFields, [field]: value }
		setDateFields(newDateFields)

		if (field === 'day') setIsDayEmpty(false)
		if (field === 'month') setIsMonthEmpty(false)
		if (field === 'year') setIsYearEmpty(false)

		if (
			validateDate(newDateFields.day, newDateFields.month, newDateFields.year)
		) {
			const birthDate = `${newDateFields.year}-${newDateFields.month.padStart(
				2,
				'0'
			)}-${newDateFields.day.padStart(2, '0')}`
			setFormData({ ...formData, birthDate })
		}
	}

	const handleCountrySelect = (country: string) => {
		setFormData({ ...formData, country })
		setIsCountryDropdownOpen(false)
		setCountrySearch('')
		setIsCountryEmpty(false)
	}

	const handleNext = () => {
		const validationErrors = validateForm()
		if (validationErrors.length > 0) {
			showError('Ошибка', validationErrors.join('\n'))
		} else {
			onNext()
		}
	}

	return (
		<div className='w-[656px] mt-12'>
			<div
				className={`flex items-center gap-3 ${
					isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
				} p-3 rounded-lg border border-[#33313B] mb-6`}
			>
				<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
				<p
					className={`${
						isDark ? 'text-[#C7C7C7]' : 'text-black'
					} text-sm font-roboto ssm:text-center`}
				>
					Мы используем эти данные для персонализации рекомендаций и рекламы.
				</p>
			</div>

			<div className='space-y-10'>
				<div>
					<div
						className={`flex items-center gap-3 ${
							isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
						} p-3 rounded-lg border border-[#33313B] mb-6`}
					>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<div className='flex flex-col'>
							<label
								className={`block ${
									isDark ? 'text-white' : 'text-black'
								} mb-1 text-sm font-medium`}
							>
								Дата рождения
							</label>
							<p
								className={`${
									isDark ? 'text-[#C7C7C7]' : 'text-black'
								} text-[13px] font-roboto ssm:text-center`}
							>
								Зачем указывать дату рождения?{' '}
								<span
									className={`underline cursor-pointer ${
										isDark ? 'text-purple-500' : 'text-purple-600 text-semibold'
									}`}
								>
									Узнать...
								</span>
							</p>
						</div>
					</div>

					<div className='flex gap-8 mt-8 justify-center'>
						<input
							type='text'
							placeholder='дд'
							value={dateFields.day}
							onChange={e => handleDateChange('day', e.target.value)}
							className={`${
								isDark
									? 'bg-[#33313B] text-white'
									: 'text-black bg-[#e5e7eb] border border-black'
							} ${
								isDayEmpty
									? 'border border-red-500 focus:ring-purple-500 focus:border-none focus:ring-1'
									: ''
							} pt-2 pb-2 text-center pr-2 rounded w-[150px] h-[55px] placeholder-[#7C7C7C] input outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300`}
							maxLength={2}
						/>
						<select
							value={dateFields.month}
							onChange={e => handleDateChange('month', e.target.value)}
							className={`${
								isDark
									? 'bg-[#33313B] text-white'
									: 'bg-[#e5e7eb] border text-black border-black'
							} ${
								isMonthEmpty
									? 'border border-red-500 focus:ring-purple-500 focus:border-none focus:ring-1'
									: ''
							} pt-2 pb-2 pl-4 pr-2 rounded w-[150px] h-[55px] placeholder-[#7C7C7C] input outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 appearance-none cursor-pointer`}
							style={{
								backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237C7C7C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
								backgroundRepeat: 'no-repeat',
								backgroundPosition: 'right 12px center',
								backgroundSize: '16px',
							}}
						>
							<option value='' disabled className='text-[#7C7C7C]'>
								Месяц
							</option>
							{months.map(month => (
								<option
									key={month.value}
									value={month.value}
									className={`${
										isDark ? 'bg-[#33313B] text-white' : 'bg-[#e5e7eb] text-black'
									} border-none`}
								>
									{month.label}
								</option>
							))}
						</select>
						<input
							type='text'
							placeholder='гггг'
							value={dateFields.year}
							onChange={e => handleDateChange('year', e.target.value)}
							className={`${
								isDark
									? 'bg-[#33313B] text-white'
									: 'bg-[#e5e7eb] border text-black border-black'
							} ${
								isYearEmpty
									? 'border border-red-500 focus:ring-purple-500 focus:border-none focus:ring-1'
									: ''
							} pt-2 pb-2 text-center pr-2 rounded w-[150px] h-[55px] placeholder-[#7C7C7C] input outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300`}
							maxLength={4}
						/>
					</div>
				</div>

				<div className='relative'>
					<label className='block text-white text-sm font-medium mb-4'>
						Страна проживания
					</label>
					<div className='relative'>
						<div
							onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
							className={`${
								isDark
									? 'bg-[#33313B] text-white'
									: 'text-black bg-[#e5e7eb] border border-black'
							} ${
								isCountryEmpty
									? 'border border-red-500 focus:ring-red-500 focus:ring-1'
									: ''
							} pt-2 pb-2 pl-4 pr-12 rounded w-full h-[55px] text-white ssm:w-[270px] select m-0 mx-auto flex items-center cursor-pointer outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 relative`}
						>
							<span
								className={`${
									isDark ? 'text-white' : 'text-black'
								} text-[#7C7C7C]`}
							>
								{formData.country || 'Выберите страну'}
							</span>
							<div
								className='absolute right-4 transition-transform duration-200'
								style={{
									transform: isCountryDropdownOpen
										? 'rotate(180deg)'
										: 'rotate(0deg)',
								}}
							>
								<svg
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='#7C7C7C'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<polyline points='6,9 12,15 18,9'></polyline>
								</svg>
							</div>
						</div>

						{isCountryDropdownOpen && (
							<div className={`absolute top-[-500%] left-1/2 transform -translate-x-1/2 mt-2 w-full ssm:w-[270px] bg-[#33313B] rounded-2xl shadow-lg border border-[#444] z-50 max-h-64 overflow-hidden`}>
								<div className='p-3 border-b border-[#444]'>
									<input
										type='text'
										placeholder='Поиск страны...'
										value={countrySearch}
										onChange={e => setCountrySearch(e.target.value)}
										className='w-full bg-[#2A2831] text-white placeholder-[#7C7C7C] px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300'
										onClick={e => e.stopPropagation()}
									/>
								</div>
								<div className='max-h-48 overflow-y-auto custom-scrollbar'>
									{filteredCountries.length > 0 ? (
										filteredCountries.map(country => (
											<div
												key={country}
												onClick={() => handleCountrySelect(country)}
												className='px-4 py-3 text-white hover:bg-[#444] cursor-pointer transition-colors duration-200 border-b border-[#444] last:border-b-0'
											>
												{country}
											</div>
										))
									) : (
										<div className='px-4 py-3 text-[#7C7C7C] text-center'>
											Страна не найдена
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className='flex gap-12 justify-center mt-8'>
				<BackButton onBack={onBack} isLoading={false} disabled={false} />
				<NextButton handleNext={handleNext} />
			</div>

			<style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2a2831;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #7c7c7c;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
		</div>
	)
}
