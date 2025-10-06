import React, { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Divider, { DividerOr } from '../../../ui/Divider/Divider'
import { StepIndicator } from '../../../utils/StepIndicator/StepIndicator'

import { BirthDateStep } from './Steps/BirthDateStep'
import { EmailStep } from './Steps/EmailStep'
import { EmailValidationStep } from './Steps/EmailValidationStep'
import { NameStep } from './Steps/NameStep'
import { PasswordStep } from './Steps/PasswordStep'

import { useNotifications } from '../../../utils/Notification/hooks/useNotification'
import type { FormData, RegistrationFlowProps } from './types'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
	onStepChange,
	onSuccessChange,
	onClose,
	onSwitchToLogin,
}) => {
	const [step, setStep] = useState<number>(1)
	const [formData, setFormData] = useState<FormData>({
		email: '',
		userName: '',
		firstName: '',
		artistName: '',
		birthDate: '',
		country: '',
		password: '',
		hash: '',
	})
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isSuccess, setIsSuccess] = useState<boolean>(false)

	const { showError, showSuccess } = useNotifications()

	const { isDark } = useTheme()

	const navigate = useNavigate()

	useEffect(() => {
		if (onStepChange) {
			onStepChange(step)
		}
	}, [step, onStepChange])

	useEffect(() => {
		if (onSuccessChange) {
			onSuccessChange(isSuccess)
		}

		if (isSuccess) {
			const timer = setTimeout(() => {
				onClose?.()
				navigate('/')
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [isSuccess, onSuccessChange, navigate, onClose])

	const nextStep = () => setStep(prev => prev + 1)
	const prevStep = () => setStep(prev => prev - 1)

	const backStepNameStep = () => setStep(1)

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (isLoading) return
		setIsLoading(true)

		try {
			const response = await fetch('http://localhost:8080/signupsend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			if (!response.ok) {
				const errorText = await response.text()
				showError(errorText || 'Ошибка при регистрации.')
				setIsLoading(false)
				return
			}

			showSuccess('Успешная регистрация')
			setIsSuccess(true)
			try {
				window.dispatchEvent(new Event('artistsUpdated'))
			} catch (err) {
				console.warn('Ошибка обновления списка исполнителей:', err)
			}
		} catch (error) {
			showError('Ошибка при регистрации.', error)
			setIsLoading(false)
		}
	}

	console.log('formData:', formData)

	return (
		<div className='text-white font-roboto w-[520px] flex justify-center flex-col items-center m-auto relative'>
			{step === 1 && (
				<>
					<Divider text='Зарегистрироваться' />
					<DividerOr />
				</>
			)}

			<>
				<StepIndicator currentStep={step} />
				{step === 1 && (
					<EmailStep
						onNext={nextStep}
						formData={formData}
						setFormData={setFormData}
					/>
				)}
				{step === 2 && (
					<EmailValidationStep
						onNext={nextStep}
						onBack={prevStep}
						formData={formData}
						setFormData={setFormData}
					/>
				)}
				{step === 3 && (
					<NameStep
						onNext={nextStep}
						onBack={backStepNameStep}
						formData={formData}
						setFormData={setFormData}
					/>
				)}
				{step === 4 && (
					<BirthDateStep
						onNext={nextStep}
						onBack={prevStep}
						formData={formData}
						setFormData={setFormData}
					/>
				)}
				{step === 5 && (
					<PasswordStep
						onNext={handleSubmit}
						onBack={prevStep}
						formData={formData}
						setFormData={setFormData}
					/>
				)}
				{isLoading && (
					<div className='mt-6 text-center'>
						<div
							className={`flex items-center w-[520px] gap-3 ${
								isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
							} p-3 rounded-lg border border-[#33313B] mb-2`}
						>
							<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
							<p
								className={`${
									isDark ? 'text-[#C7C7C7]' : 'text-black'
								} text-sm`}
							>
								Выполняется регистрация...
							</p>
						</div>
					</div>
				)}

				{step === 1 && onSwitchToLogin && (
					<div className='text-center mt-[40px]'>
						<span
							className={`text-sm ${isDark ? 'text-[#C7C7C7]' : 'text-black'}`}
						>
							Уже есть аккаунт?{' '}
						</span>
						<span
							className={`underline text-sm underline-offset-4 cursor-pointer ${
								isDark
									? 'text-[#fff] hover:text-purple-400'
									: 'text-black hover:text-purple-600'
							}  transition-colors`}
							onClick={onSwitchToLogin}
						>
							Войдите
						</span>
					</div>
				)}
			</>
		</div>
	)
}

export default RegistrationFlow
