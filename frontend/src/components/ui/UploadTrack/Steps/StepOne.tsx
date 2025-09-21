import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'

import type { RenderStep1Props } from './types'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const RenderStep1 = ({
	fileInputRef,
	handleTrackChange,
}: RenderStep1Props) => {
	const { isDark } = useTheme()

	return (
		<motion.div
			initial={{ opacity: 1, y: 0 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className='text-center mt-8'
		>
			<div
				onClick={() => fileInputRef.current?.click()}
				className={`w-100 h-64 mx-auto border-2 border-dashed border-[#A855F7] rounded-lg flex flex-col items-center justify-center cursor-pointer ${isDark ? "hover:bg-[#36343F]" : "hover:bg-[#E5E7EB]"} transition-colors`}
			>
				<Upload size={48} className='text-[#A855F7] mb-4' />
				<p className={`${isDark ? "text-white" : "text-black"} font-medium`}>Перетащите аудиофайл или</p>
				<p className={`${isDark ? "text-[#A855F7]" : "text-purple-500"} font-medium`}>выберите файл</p>
				<p className='text-gray-400 text-sm mt-2'>MP3/WAV/FLAC</p>
			</div>
			<input
				type='file'
				ref={fileInputRef}
				onChange={handleTrackChange}
				className='hidden'
				accept='audio/*'
				aria-label='Upload audio file'
			/>
		</motion.div>
	)
}
