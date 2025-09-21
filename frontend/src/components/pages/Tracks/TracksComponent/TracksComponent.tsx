import { FileUp } from 'lucide-react'
import { useTheme } from '../../../utils/Theme/hooks/useTheme'

import { useModal } from '../../../ui/Modal/hooks/useModal'
import { Modal } from '../../../ui/Modal/Modal'

import { UploadTrack } from '../../../ui/UploadTrack/UploadTrack'

export const TracksComponent = () => {
	const { isDark } = useTheme()
	const uplaodTrackModal = useModal('uplaodTrackModal')

	return (
		<div
			className={`w-full h-[250px] ${
				isDark ? 'bg-[#24232B]' : 'bg-[#E5E7EB]'
			} border-none rounded-2xl shadow-xl overflow-hidden p-8 font-sans transform transition-all duration-300 hover:shadow-2xl`}
		>
			<div className='flex justify-between items-center'>
				<h1
					className={`text-2xl font-bold mb-6 ${
						isDark ? 'text-white' : 'text-black'
					}`}
				>
					Общедоступные треки
				</h1>

				<button
					onClick={uplaodTrackModal.openModal}
					className='bg-purple-600 cursor-pointer hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200 transform shadow-lg'
				>
					<FileUp size={18} />
					Загрузить трек
				</button>
			</div>
			<Modal
				id='uplaodTrackModal'
				isOpen={uplaodTrackModal.isOpen}
				onClose={uplaodTrackModal.closeModal}
				size='md'
			>
				<UploadTrack onUploadSuccess={uplaodTrackModal.closeModal} />
			</Modal>
		</div>
	)
}
