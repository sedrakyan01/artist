import { motion } from 'framer-motion'

import { AnimatePresence } from 'framer-motion'

import { Image as ImageIcon, X } from 'lucide-react'

import { useNotifications } from '../../../utils/Notification/hooks/useNotification'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import type { RenderStep2Props } from './types'

export const RenderStep2 = ({
	setCurrentStep,
	setLoadingState,
	loadingState,
	trackMeta,
	previewCover,
	imageInputRef,
	handleCoverChange,
	handleMetaChange,
	setCoverFile,
	setPreviewCover,
}: RenderStep2Props) => {
	const { showError } = useNotifications()
	const { isDark } = useTheme()

	return (
		<motion.form
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			onSubmit={e => {
				e.preventDefault()
				if (!trackMeta.title || !trackMeta.artist_name || !previewCover) {
					setLoadingState(prev => ({
						...prev,
					}))
					showError(
						'Ошибка загрузки трека',
						'Проверьте что все нужные поля заполнены'
					)
					return
				}
				setCurrentStep(3)
			}}
			className='space-y-12'
		>
			<div className='flex px-6 gap-6'>
				<div>
					<div
						onClick={() => imageInputRef.current?.click()}
						className={`w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer ${isDark ? "hover:bg-[#36343F]" : "hover:bg-[#E5E7EB]"} transition-colors ${
							previewCover ? 'border-[#A855F7]' : 'border-[#A855F7]'
						}`}
					>
						{previewCover ? (
							<div className='relative w-full h-full'>
								<img
									src={previewCover}
									alt='Cover preview'
									className='w-full h-full object-cover rounded-lg'
								/>
								<button
									type='button'
									onClick={e => {
										e.stopPropagation()
										setCoverFile(null)
										setPreviewCover(null)
										if (imageInputRef.current) imageInputRef.current.value = ''
									}}
									className={`absolute top-2 right-2 bg-[#28262F] bg-opacity-70 rounded-full p-1`}
									aria-label='Remove cover image'
								>
									<X size={16} className='text-white' />
								</button>
							</div>
						) : (
							<>
								<ImageIcon size={32} className='text-[#A855F7] mb-2' />
								<p className={`${isDark ? "text-gray-400" : "text-black"} text-xs`}>
									Загрузить обложку <span className='text-red-500'>*</span>
								</p>
							</>
						)}
					</div>
					<input
						type='file'
						ref={imageInputRef}
						onChange={handleCoverChange}
						className='hidden'
						accept='image/*'
						aria-label='Upload cover image'
					/>
				</div>
				<div className='flex-1 space-y-4'>
					<div>
						<label
							htmlFor='title'
							className={`block ${
								isDark ? 'text-gray-400' : 'text-black'
							} text-sm mb-2`}
						>
							Название трека <span className='text-red-500'>*</span>
						</label>
						<input
							id='title'
							type='text'
							name='title'
							value={trackMeta.title}
							maxLength={10}
							onChange={handleMetaChange}
							className={`w-full ${
								isDark
									? 'bg-[#36343F] text-white'
									: 'bg-[#e5e7eb] placeholder-black text-black'
							} rounded p-3 hover:ring-2 hover:ring-purple-600 focus:ring-2 focus:ring-purple-600 transition-all duration-300 outline-none border border-[#524D6B]`}
							placeholder='Введите название трека'
							required
							aria-required='true'
						/>
					</div>
					<div>
						<label
							htmlFor='artist_name'
							className={`block ${
								isDark ? 'text-gray-400' : 'text-black'
							} text-sm mb-2`}
						>
							Исполнитель <span className='text-red-500'>*</span>
						</label>
						<input
							id='artist_name'
							type='text'
							name='artist_name'
							value={trackMeta.artist_name}
							onChange={handleMetaChange}
							className={`w-full ${
								isDark
									? 'bg-[#36343F] text-white'
									: 'bg-[#e5e7eb] placeholder-black text-black'
							} rounded p-3 hover:ring-2 hover:ring-purple-600 focus:ring-2 focus:ring-purple-600 transition-all duration-300 outline-none border border-[#524D6B]`}
							placeholder='Введите имя исполнителя'
							required
							aria-required='true'
						/>
					</div>
					<div>
						<label htmlFor='genre' className={`block ${isDark ? "text-gray-400" : "text-black"} text-sm mb-2`}>
							Жанр <span className='text-red-500'>*</span>
						</label>
						<select
							id='genre'
							name='genre'
							value={trackMeta.genre}
							onChange={handleMetaChange}
							className={`w-full ${
								isDark
									? 'bg-[#36343F] text-white'
									: 'bg-[#e5e7eb] placeholder-black text-black'
							} rounded p-3 hover:ring-2 hover:ring-purple-600 focus:ring-2 focus:ring-purple-600 transition-all duration-300 outline-none border border-[#524D6B] appearance-none hover:cursor-pointer`}
							required
							aria-required='true'
						>
							<option value=''>Выберите жанр</option>
							<option value='Pop'>Поп</option>
							<option value='Rock'>Рок</option>
							<option value='Hiphop'>Хип-хоп</option>
							<option value='Electronic'>Электронная</option>
							<option value='Classical'>Классическая</option>
							<option value='Jazz'>Джаз</option>
							<option value='Other'>Другое</option>
						</select>
					</div>
				</div>
			</div>
			<AnimatePresence>
				{loadingState.error && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className='p-3 bg-red-900/30 text-red-400 rounded-lg border border-red-500/50'
					>
						{loadingState.error}
					</motion.div>
				)}
			</AnimatePresence>
			<div className='flex justify-between pt-4 px-12 gap-12'>
				<button
					type='button'
					onClick={() => setCurrentStep(1)}
					className={`w-[320px] ${isDark ? "bg-transparent text-white" : "bg-[#E5E7EB] text-black"}  border-2 mt-2 cursor-pointer rounded-3xl p-3 font-semibold ssm:w-[270px] m-auto button transition-opacity duration-300`}
				>
					Назад
				</button>
				<motion.button
					type='submit'
					className={`w-[320px] bg-gradient-to-r from-purple-500 to-indigo-600 cursor-pointer mt-2 rounded-3xl p-3 font-semibold ssm:w-[270px] m-auto button transition-opacity duration-300`}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					Продолжить
				</motion.button>
			</div>
		</motion.form>
	)
}
