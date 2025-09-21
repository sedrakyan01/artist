import React from 'react'
import type { StepIndicatorProps } from './types'

import { useTheme } from '../Theme/hooks/useTheme'

export const StepIndicator: React.FC<StepIndicatorProps> = ({
	currentStep,
}) => {
	const { isDark } = useTheme()
	const progress = (currentStep / 5) * 100

	return (
		<div className='w-full mb-[20px] mt-4'>
			<div className='flex justify-between mb-2'>
				<span className={`text-sm ${isDark ? "font-bold" : "font-normal"} bg-gradient-to-r from-purple-500 to-indigo-600 text-transparent bg-clip-text`}>
					Шаг {currentStep} из 5
				</span>
				<span className='text-sm text-[#7C7C7C]'>{Math.round(progress)}%</span>
			</div>
			<div className={`w-full h-1 ${isDark ? "bg-[#262626]" : "bg-[#E5e7eb]"} rounded-full`}>
				<div
					className='h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-300'
					style={{ width: `${progress}%` }}
				></div>
			</div>
		</div>
	)
}
