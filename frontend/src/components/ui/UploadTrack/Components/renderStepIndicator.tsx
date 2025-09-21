import { Check } from 'lucide-react'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const RenderStepIndicator = ({ currentStep }) => {
	const { isDark } = useTheme()

	return (
		<div className='flex justify-center mb-0'>
			{[1, 2, 3, 4].map(step => (
				<div key={step} className='flex items-center'>
					<div
						className={`w-8 h-8 rounded-full flex items-center justify-center ${
							currentStep >= step
								? 'bg-[#A855F7] text-white'
								: `${isDark ? 'bg-[#36343F] text-gray-400' : 'bg-[#e5e7eb] text-black'}`
						}`}
					>
						{currentStep > step ? <Check size={16} /> : step}
					</div>
					{step < 4 && (
						<div
							className={`w-12 h-1 ${
								currentStep > step
									? 'bg-[#A855F7]'
									: `${isDark ? 'bg-[#36343F]' : 'bg-[#e5e7eb]'}`
							}`}
						/>
					)}
				</div>
			))}
		</div>
	)
}
