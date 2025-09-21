import { AnimatePresence, motion } from 'framer-motion'
import { Edit2, Image as ImageIcon } from 'lucide-react'
import { maxFileSizeMB } from '../Components/constants'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import type { RenderStep4Props } from './types'

export const RenderStep4 = ({
	setCurrentStep,
	loadingState,
	trackFile,
	trackMeta,
	previewCover,
	handleSubmit,
	disabled,
}: RenderStep4Props) => {
	const fileSizeMB = trackFile ? trackFile.size / 1024 / 1024 : 0
	const isFileSizeValid = fileSizeMB <= maxFileSizeMB

	const { isDark } = useTheme()

	return (
		<motion.div
			initial={{ opacity: 0, y: 0 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className='space-y-4'
		>
			<div className='px-6'>
				<div className='flex items-center mb-4'>
					{previewCover ? (
						<img
							src={previewCover}
							alt='Cover'
							className='w-16 h-16 rounded mr-4 object-cover'
						/>
					) : (
						<div className='w-16 h-16 bg-[#36343F] rounded mr-4 flex items-center justify-center'>
							<ImageIcon size={24} className='text-gray-400' />
						</div>
					)}
					<div className='flex-1'>
						<h3 className={`${isDark ? 'text-white' : 'text-black'} font-medium`}>
							{trackMeta.title || 'Без названия'}
						</h3>
						<p className='text-gray-400 text-sm'>
							{trackMeta.artist_name || 'Без исполнителя'}
						</p>
					</div>
					<button
						onClick={() => !disabled && setCurrentStep(2)}
						disabled={disabled}
						className={`${
							disabled ? 'cursor-not-allowed' : 'cursor-pointer'
						} text-gray-400 hover:text-[#A855F7] transition-colors`}
						aria-label='Edit metadata'
					>
						<Edit2 size={18} />
					</button>
				</div>
				<div className='text-gray-400 text-sm space-y-2'>
					<div
						className={`flex items-center gap-3 ${
							isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
						} p-3 rounded-lg border border-[#33313B] mb-2`}
					>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<p
							className={`${
								isDark ? 'text-[#C7C7C7]' : 'text-black'
							} text-sm ssm:text-center`}
						>
							Файл: {trackFile.name}
						</p>
					</div>
					<div
						className={`flex items-center gap-3 ${
							isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
						} p-3 rounded-lg border border-[#33313B] mb-2`}
					>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<p
							className={`${
								isDark ? 'text-[#C7C7C7]' : 'text-black'
							} text-sm ssm:text-center`}
						>
							Размер: {fileSizeMB.toFixed(2)} МБ
						</p>
					</div>
					<div
						className={`flex items-center gap-3 ${
							isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
						} p-3 rounded-lg border border-[#33313B] mb-2`}
					>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<p
							className={`${
								isDark ? 'text-[#C7C7C7]' : 'text-black'
							} text-sm ssm:text-center`}
						>
							Жанр: {trackMeta.genre}
						</p>
					</div>
					<div
						className={`flex items-center gap-3 ${
							isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
						} p-3 rounded-lg border border-[#33313B] mb-2`}
					>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<p
							className={`${
								isDark ? 'text-[#C7C7C7]' : 'text-black'
							} text-sm ssm:text-center`}
						>
							Альбом: {trackMeta.album_name || 'Не указан'}
						</p>
					</div>
					<div
						className={`flex items-center gap-3 ${
							isDark ? 'bg-[#33313B]/50' : 'bg-[#e5e7eb]'
						} p-3 rounded-lg border border-[#33313B] mb-0`}
					>
						<div className='flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full'></div>
						<p
							className={`${
								isDark ? 'text-[#C7C7C7]' : 'text-black'
							} text-sm ssm:text-center`}
						>
							Год выпуска: {trackMeta.release_year || 'Не указан'}
						</p>
					</div>
				</div>
			</div>
			<AnimatePresence>
				{loadingState.isUploading ? (
					<div>
						<div className='absolute mt-7 left-[50%] translate-x-[-50%] translate-y-[-50%]'>
							<div className='animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500 border-b-2 border-l-2'></div>
						</div>
					</div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='flex justify-end pt-0'
					>
						<motion.button
							onClick={handleSubmit}
							className={`w-[320px] bg-gradient-to-r from-purple-500 to-indigo-600 cursor-pointer mt-0 rounded-3xl p-3 font-semibold ssm:w-[270px] m-auto button transition-opacity duration-300 ${
								isFileSizeValid ? '' : 'opacity-50 cursor-not-allowed'
							}`}
							disabled={loadingState.isUploading || !isFileSizeValid}
							whileHover={{ scale: isFileSizeValid ? 1.02 : 1 }}
							whileTap={{ scale: isFileSizeValid ? 0.98 : 1 }}
						>
							Загрузить
						</motion.button>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}
