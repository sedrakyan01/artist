import { ChangeEvent, useState } from 'react'

import type { FormData, NameStepProps } from '../types'

import { BackButton, NextButton } from '../../../../ui/Buttons/NameStep/Buttons'

import { useTheme } from '../../../../utils/Theme/hooks/useTheme'

export const NameStep: React.FC<NameStepProps> = ({
	onNext,
	onBack,
	formData,
	setFormData,
}) => {
	const [isUserNameEmpty, setIsUserNameEmpty] = useState<boolean>(false)
	const [isFirstNameEmpty, setIsFirstNameEmpty] = useState<boolean>(false)
	const [isArtistNameEmpty, setIsArtistNameEmpty] = useState<boolean>(false)

	const { isDark } = useTheme()

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData({ ...formData, [field]: value })
		if (field === 'userName') setIsUserNameEmpty(false)
		if (field === 'firstName') setIsFirstNameEmpty(false)
		if (field === 'artistName') setIsArtistNameEmpty(false)
	}

	return (
		<div className='w-[656px]'>
			<div
				className={`flex items-center gap-3 ${
					isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
				} p-3 rounded-lg border border-[#33313B] mb-2`}
			>
				<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
				<p
					className={`${
						isDark ? 'text-[#C7C7C7]' : 'text-black'
					} text-sm mb-0 font-roboto ssm:text-center`}
				>
					Вы сможете изменить имя в настройках.
				</p>
			</div>
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
					Буквы, цифры, подчёркивания.{' '}
					<span className={`${isDark ? 'text-purple-500' : 'text-purple-600'}`}>
						3–15
					</span>{' '}
					символов.
				</p>
			</div>
			<div className='space-y-4'>
				<div className='m-auto mb-4 flex justify-center flex-col'>
					<label
						className={`block ${
							isDark ? 'text-white' : 'text-black'
						} text-sm font-medium mb-2`}
					>
						@Пользователь <span className='text-red-500'>*</span>
					</label>
					<input
						type='text'
						value={formData.userName}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							handleInputChange('userName', e.target.value)
						}
						placeholder='Мой ответ'
						className={`${
							isDark ? 'bg-[#33313B] text-white' : 'bg-[#e5e7eb] text-black'
						} pt-2 ${
							isUserNameEmpty
								? 'border border-red-500 focus:ring-purple-500 focus:border-none focus:ring-1'
								: ''
						} pb-2 pl-4 pr-2 m-auto rounded w-full h-[55px] placeholder-[#7C7C7C] ssm:w-[270px] input outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300`}
					/>
				</div>
				<div className='m-auto mb-4 flex justify-center flex-col'>
					<label
						className={`block ${
							isDark ? 'text-white' : 'text-black'
						} text-sm font-medium mb-2`}
					>
						Имя <span className='text-red-500'>*</span>
					</label>
					<input
						type='text'
						value={formData.firstName}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							handleInputChange('firstName', e.target.value)
						}
						placeholder='Мой ответ'
						className={`${
							isDark ? 'bg-[#33313B] text-white' : 'bg-[#e5e7eb] text-black'
						} pt-2 ${
							isFirstNameEmpty
								? 'border border-red-500 focus:ring-purple-500 focus:border-none focus:ring-1'
								: ''
						} pb-2 pl-4 pr-2 rounded m-auto w-full h-[55px] placeholder-[#7C7C7C] ssm:w-[270px] input outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300`}
					/>
				</div>
				<div className='m-auto flex justify-center flex-col'>
					<label className={`block ${isDark ? 'text-white' : 'text-black'} text-sm font-medium mb-2`}>
						Артист <span className='text-red-500'> *</span>
					</label>
					<input
						type='text'
						value={formData.artistName}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							handleInputChange('artistName', e.target.value)
						}
						placeholder='Мой ответ'
						className={`${isDark ? 'bg-[#33313B] text-white' : 'bg-[#e5e7eb] text-black'} pt-2 pb-2 ${
							isArtistNameEmpty
								? 'border border-red-500 focus:ring-purple-500 focus:border-none focus:ring-1'
								: ''
						} pl-4 pr-2 rounded m-auto w-full h-[55px] placeholder-[#7C7C7C] ssm:w-[270px] input outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300`}
					/>
				</div>
			</div>

			<div className={`flex gap-12 justify-center mb-5 mt-10`}>
				<BackButton onBack={onBack} isLoading={false} disabled={false} />
				<NextButton
					onNext={onNext}
					isLoading={false}
					disabled={false}
					formData={formData}
					setFormData={setFormData}
					isUserNameEmpty={isUserNameEmpty}
					isFirstNameEmpty={isFirstNameEmpty}
					isArtistNameEmpty={isArtistNameEmpty}
					setIsUserNameEmpty={setIsUserNameEmpty}
					setIsFirstNameEmpty={setIsFirstNameEmpty}
					setIsArtistNameEmpty={setIsArtistNameEmpty}
				/>
			</div>
		</div>
	)
}
