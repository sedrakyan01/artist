import { ChangeEvent, FormEvent, useState } from 'react'
import type { PasswordStepProps } from '../types'

import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

import {
	BackButton,
	NextButton,
} from '../../../../ui/Buttons/PasswordStep/Buttons'

export const PasswordStep: React.FC<PasswordStepProps> = ({
	onNext,
	onBack,
	formData,
	setFormData,
}) => {
	const { isDark } = useTheme()
	const [passwordError, setPasswordError] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const hasLetter = (password: string): boolean => /[a-zA-Z]/.test(password)
	const hasNumberOrSpecial = (password: string): boolean =>
		/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)
	const isLongEnough = (password: string): boolean => password.length >= 10

	const validatePassword = (password: string): string => {
		if (!password) {
			return 'Пароль не может быть пустым.'
		}
		if (!hasLetter(password)) {
			return 'Пароль должен содержать хотя бы одну букву.'
		}
		if (!hasNumberOrSpecial(password)) {
			return 'Пароль должен содержать хотя бы одну цифру или специальный символ.'
		}
		if (!isLongEnough(password)) {
			return 'Пароль должен содержать не менее 10 символов.'
		}
		return ''
	}

	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
		const password = e.target.value
		setFormData({ ...formData, password })
	}

	const handleNext = () => {
		if (isLoading) return
		setIsLoading(true)

		const error = validatePassword(formData.password)
		if (error) {
			setPasswordError(error)
			setIsLoading(false)
			return
		}

		setPasswordError('')
		const syntheticEvent: FormEvent<HTMLFormElement> = {
			preventDefault: () => {},
		} as FormEvent<HTMLFormElement>
		onNext(syntheticEvent)
	}

	return (
		<div className='w-[656px] mt-12'>
			{passwordError && (
				<p className='text-[#f3727f] text-sm mb-4'>{passwordError}</p>
			)}
			<div>
				<ul className='space-y-4 mb-8 ssm:px-4'>
					<div className={`flex items-center gap-3 ${isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'} p-3 rounded-lg border border-[#33313B] mb-4`}>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<li className={`${isDark ? 'text-[#C7C7C7]' : 'text-black'} text-sm ssm:text-center`}>
							Пароль должен содержать как минимум
						</li>
					</div>

					<div className={`flex items-center gap-3 ${isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'} p-3 rounded-lg border border-[#33313B] mb-2`}>
						<li className='flex items-center gap-2 text-sm'>
							<svg
								className='flex-shrink-0'
								aria-hidden='true'
								width='16'
								height='16'
								viewBox='0 0 12 12'
							>
								<ellipse
									cx='6'
									cy='6'
									rx='5.5'
									ry='5.5'
									stroke={hasLetter(formData.password) ? '#34D399' : `${isDark ? '#fff' : '#000'}`}
									strokeWidth='1.5'
									fill='none'
								/>
								{hasLetter(formData.password) && (
									<path
										d='M3 6l2 2l4-4'
										stroke='#34D399'
										strokeWidth='1.5'
										fill='none'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								)}
							</svg>
							<span
								className={
									hasLetter(formData.password) ? `${isDark ? 'text-green-400' : 'text-green-500'}` : `${isDark ? 'text-white' : 'text-black'}`
								}
							>
								1 букву
							</span>
						</li>
					</div>

					<div className={`flex items-center gap-3 ${isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'} p-3 rounded-lg border border-[#33313B] mb-2`}>
						<li className='flex items-center gap-2 text-sm'>
							<svg
								className='flex-shrink-0'
								aria-hidden='true'
								width='16'
								height='16'
								viewBox='0 0 12 12'
							>
								<ellipse
									cx='6'
									cy='6'
									rx='5.5'
									ry='5.5'
									stroke={
										hasNumberOrSpecial(formData.password) ? '#34D399' : `${isDark ? '#fff' : '#000'}`
									}
									strokeWidth='1.5'
									fill='none'
								/>
								{hasNumberOrSpecial(formData.password) && (
									<path
										d='M3 6l2 2l4-4'
										stroke='#34D399'
										strokeWidth='1.5'
										fill='none'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								)}
							</svg>
							<span
								className={
									hasNumberOrSpecial(formData.password)
										? `${isDark ? 'text-green-400' : 'text-green-500'}`
										: `${isDark ? 'text-white' : 'text-black'}`
								}
							>
								1 цифру или специальный символ
							</span>
						</li>
					</div>

					<div className={`flex items-center gap-3 ${isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'} p-3 rounded-lg border border-[#33313B] mb-2`}>
						<li className='flex items-center gap-2 text-sm'>
							<svg
								className='flex-shrink-0'
								aria-hidden='true'
								width='16'
								height='16'
								viewBox='0 0 12 12'
							>
								<ellipse
									cx='6'
									cy='6'
									rx='5.5'
									ry='5.5'
									stroke={isLongEnough(formData.password) ? '#34D399' : `${isDark ? '#fff' : '#000'}`}
									strokeWidth='1.5'
									fill='none'
								/>
								{isLongEnough(formData.password) && (
									<path
										d='M3 6l2 2l4-4'
										stroke='#34D399'
										strokeWidth='1.5'
										fill='none'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								)}
							</svg>
							<span
								className={
									isLongEnough(formData.password)
										? `${isDark ? 'text-green-400' : 'text-green-500'}`
										: `${isDark ? 'text-white' : 'text-black'}`
								}
							>
								10 символов
							</span>
						</li>
					</div>
				</ul>
			</div>
			<input
				type='password'
				value={formData.password}
				onChange={handlePasswordChange}
				placeholder='Введите пароль'
				className={`${isDark ? "bg-[#33313B] text-white" : "bg-[#e5e7eb] text-black placeholder-[#7C7C7C]"} w-full pt-2 pb-2 pl-4 mb-4 pr-2 rounded-full w-FULL h-[55px] placeholder-[#7C7C7C] ssm:w-[270px] input outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300`}
				disabled={isLoading}
			/>
			<div className='flex gap-12 justify-center mt-4'>
				<BackButton onBack={onBack} />
				<NextButton handleNext={handleNext} formData={formData} />
			</div>
		</div>
	)
}
