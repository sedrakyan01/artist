import { ChangeEvent, useEffect, useRef, useState } from 'react'
import type { EmailValidationProps } from '../types'

import {
	BackButton,
	NextButton,
} from '../../../../ui/Buttons/EmailValidationStep/Buttons'
import { useNotifications } from '../../../../utils/Notification/hooks/useNotification'

import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

export const EmailValidationStep: React.FC<EmailValidationProps> = ({
	onNext,
	onBack,
	formData,
	setFormData,
}) => {
	const [code, setCode] = useState<string>('')
	const [codeError, setCodeError] = useState<string>('')
	const [codeTouched, setCodeTouched] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [timeLeft, setTimeLeft] = useState<number>(0)
	const [isResendActive, setIsResendActive] = useState<boolean>(false)
	const [resendCount, setResendCount] = useState<number>(0)

	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	const { isDark } = useTheme()

	const { showError } = useNotifications()

	const COOLDOWN_TIME = 30
	const MAX_RESENDS = 5

	useEffect(() => {
		if (isResendActive && timeLeft > 0) {
			intervalRef.current = setInterval(() => {
				setTimeLeft(prev => {
					if (prev <= 1) {
						setIsResendActive(false)
						return 0
					}
					return prev - 1
				})
			}, 1000)
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [isResendActive, timeLeft])

	const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newCode = e.target.value.replace(/\D/g, '')
		if (newCode.length <= 6) {
			setCode(newCode)
			setCodeError('')
			setCodeTouched(true)
		}
	}

	const handleResendCode = async () => {
		if (resendCount >= MAX_RESENDS) return

		setIsLoading(true)
		try {
			await new Promise(resolve => setTimeout(resolve, 1000))

			setTimeLeft(COOLDOWN_TIME)
			setIsResendActive(true)
			setResendCount(prev => prev + 1)
		} catch (error) {
			showError('Ошибка при отправке кода', error)
		} finally {
			setIsLoading(false)
		}
	}

	const formatTime = (seconds: number) => {
		return seconds < 10 ? `0${seconds}` : `${seconds}`
	}

	const getResendText = () => {
		if (resendCount >= MAX_RESENDS) return 'Лимит исчерпан'
		if (isResendActive && timeLeft > 0)
			return `Повторить через ${formatTime(timeLeft)}с`
		return 'Отправить код еще раз'
	}

	return (
		<div>
			<div className='flex justify-center flex-col'>
				<div className='text-center mb-6'></div>

				<div className='grid grid-cols-1 gap-3 mb-6'>
					<div
						className={`flex items-center gap-3 ${
							isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
						} p-3 rounded-lg border border-[#33313B] backdrop-blur-sm`}
					>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<span
							className={`text-sm font-semibold ${
								isDark ? 'text-white' : 'text-black'
							}`}
						>
							6-значный цифровой код
						</span>
					</div>
					<div
						className={`flex items-center gap-3 ${
							isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
						} p-3 rounded-lg border border-[#33313B] backdrop-blur-sm`}
					>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<span
							className={`text-sm font-semibold ${
								isDark ? 'text-white' : 'text-black'
							}`}
						>
							Проверьте папку спам/промоакции
						</span>
					</div>
					<div
						className={`flex items-center gap-3 ${
							isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
						} p-3 rounded-lg border border-[#33313B] backdrop-blur-sm`}
					>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<span
							className={`text-sm font-semibold ${
								isDark ? 'text-white' : 'text-black'
							}`}
						>
							Код действителен 3 минуты
						</span>
					</div>
				</div>

				<div className='mt-6 space-y-4'>
					<div className='relative'>
						<div className='flex items-center justify-center gap-2 mb-2'>
							<div
								className={`px-2 w-full text-center font-semibold py-1  rounded text-sm ${
									isDark
										? 'text-[#7C7C7C]  bg-[#33313B]/70'
										: 'text-black bg-[#e5e7eb]'
								}`}
							>
								{formData.email}
							</div>
						</div>
					</div>

					<div className='relative group'>
						<input
							type='text'
							value={code}
							onChange={handleCodeChange}
							onBlur={() => setCodeTouched(true)}
							placeholder='000000'
							className={`${
								isDark ? 'bg-[#33313B] text-white' : 'bg-[#e5e7eb] text-black'
							} pt-2 pb-2 pl-8 pr-12 rounded-lg m-auto w-full h-[55px]  placeholder-[#7C7C7C] ssm:w-[270px] outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-center text-xl font-semibold tracking-[0.5em] border border-[#33313B] focus:border-purple-500`}
							disabled={isLoading}
							maxLength={6}
						/>
						<div
							className='absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300'
							style={{ width: `${(code.length / 6) * 100}%` }}
						></div>
						{code && (
							<button
								onClick={() => setCode('')}
								className='absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7C7C7C] hover:text-white transition-colors duration-200'
							>
								<svg
									className='w-4 h-4'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						)}
					</div>

					<div className='flex justify-center'>
						<button
							onClick={handleResendCode}
							disabled={
								isLoading ||
								(isResendActive && timeLeft > 0) ||
								resendCount >= MAX_RESENDS
							}
							className={`text-sm cursor-pointer font-medium transition-all duration-200 px-4 py-2 rounded-lg flex items-center gap-2 ${
								isLoading ||
								(isResendActive && timeLeft > 0) ||
								resendCount >= MAX_RESENDS
									? 'text-[#7C7C7C] cursor-not-allowed'
									: 'text-[#7C7C7C] hover:text-purple-500 hover:bg-purple-500/10'
							}`}
						>
							{isLoading && (
								<div className='animate-spin rounded-full h-3 w-3 border border-purple-500 border-t-transparent'></div>
							)}
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
								/>
							</svg>
							{getResendText()}
						</button>
					</div>

					{isResendActive && timeLeft > 0 && (
						<div className='w-full bg-[#33313B] rounded-full h-1 overflow-hidden'>
							<div
								className='bg-gradient-to-r from-purple-500 to-purple-600 h-1 rounded-full transition-all duration-1000 ease-linear'
								style={{
									width: `${
										((COOLDOWN_TIME - timeLeft) / COOLDOWN_TIME) * 100
									}%`,
								}}
							></div>
						</div>
					)}
				</div>

				{codeError && codeTouched && (
					<div className='bg-[#33313B] p-4 rounded-lg text-[#f3727f] text-sm mb-4 mt-6 border border-red-500/20 backdrop-blur-sm'>
						<div className='flex items-center gap-2'>
							<svg
								className='w-4 h-4 flex-shrink-0'
								fill='currentColor'
								viewBox='0 0 20 20'
							>
								<path
									fillRule='evenodd'
									d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
									clipRule='evenodd'
								/>
							</svg>
							{codeError}
						</div>
					</div>
				)}

				<div className='flex mt-12 gap-4'>
					<BackButton onBack={onBack} isLoading={isLoading} />
					<NextButton
						onNext={onNext}
						code={code}
						formData={formData}
						setFormData={setFormData}
					/>
				</div>
			</div>
		</div>
	)
}
