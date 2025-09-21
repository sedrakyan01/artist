import { motion } from 'framer-motion'

import { AnimatePresence } from 'framer-motion'

import { Image as ImageIcon } from 'lucide-react'

import type { RenderStep3Props } from './types'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

export const RenderStep3 = ({
	setCurrentStep,
	loadingState,
	trackMeta,
	previewCover,
	handleMetaChange,
}: RenderStep3Props) => {
	const { isDark } = useTheme()

	return (
		<motion.form
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			onSubmit={e => {
				e.preventDefault()
				setCurrentStep(4)
			}}
			className='space-y-4'
		>
			<div className='flex items-center mb-4 px-6'>
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
				<div>
					<h3 className={`${isDark ? 'text-white' : 'text-black'} font-medium`}>
						{trackMeta.title || 'Без названия'}
					</h3>
					<p className='text-gray-400 text-sm'>
						{trackMeta.artist_name || 'Без исполнителя'}{' '}
						{trackMeta.genre ? `- ${trackMeta.genre}` : ''}
					</p>
				</div>
			</div>
			<div className='grid grid-cols-2 gap-4 px-6'>
				<div>
					<label
						htmlFor='album_name'
						className={`block ${
							isDark ? 'text-gray-400' : 'text-black'
						} text-sm mb-1`}
					>
						Альбом
					</label>
					<input
						id='album_name'
						type='text'
						name='album_name'
						maxLength={15}
						value={trackMeta.album_name}
						onChange={handleMetaChange}
						className={`w-full ${
							isDark ? 'bg-[#36343F] text-white' : 'bg-[#e5e7eb] text-black'
						}  rounded p-3 hover:ring-2 hover:ring-purple-600 focus:ring-2 focus:ring-purple-600 transition-all duration-300 outline-none border border-[#524D6B]`}
						placeholder='Введите название альбома'
					/>
				</div>
				<div>
					<label
						htmlFor='release_year'
						className={`block ${
							isDark ? 'text-gray-400' : 'text-black'
						} text-sm mb-1`}
					>
						Год выпуска
					</label>
					<input
						id='release_year'
						type='number'
						name='release_year'
						value={trackMeta.release_year}
						onChange={handleMetaChange}
						className={`w-full ${
							isDark ? 'bg-[#36343F] text-white' : 'bg-[#e5e7eb] text-black'
						} rounded p-3 focus:outline-none focus:ring-2 focus:ring-[#A855F7] border border-[#524D6B]`}
						min='1900'
						max={new Date().getFullYear()}
					/>
				</div>
			</div>
			<div className='px-6'>
				<label
					htmlFor='description'
					className={`block ${
						isDark ? 'text-gray-400' : 'text-black'
					} text-sm mb-1`}
				>
					Описание
				</label>
				<textarea
					id='description'
					name='description'
					maxLength={40}
					value={trackMeta.description}
					onChange={handleMetaChange}
					className={`w-full ${
						isDark ? 'bg-[#36343F] text-white' : 'bg-[#e5e7eb] text-black'
					} rounded p-3 hover:ring-2 hover:ring-purple-600 focus:ring-2 focus:ring-purple-600 transition-all duration-300 outline-none border border-[#524D6B] resize-none`}
					placeholder='Расскажите о вашем треке...'
					rows={4}
				/>
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
			<div className='flex justify-between pt-0 px-12 gap-12'>
				<button
					type='button'
					onClick={() => setCurrentStep(2)}
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
