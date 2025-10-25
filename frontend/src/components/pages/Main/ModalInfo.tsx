import { useEffect, useState } from 'react'

export const ModalInfo = () => {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const shown = localStorage.getItem('alertShown')
		if (!shown) {
			setIsVisible(true)
		}
	}, [])

	const handleClose = () => {
		localStorage.setItem('alertShown', 'true')
		setIsVisible(false)
	}

	if (!isVisible) return null

	return (
		<div className='fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]'>
			<div className='bg-[#232428] text-white rounded-2xl p-6 w-[560px] text-center shadow-2xl'>
				<h2 className='text-lg font-semibold mb-2'>Предупреждение ⚡</h2>
				<p className='text-gray-300 mb-4'>
					Сайт не доработан поэтому возможны баги, нерабочие функции и прочие
					ошибки.
				</p>
				<div className='mb-4'>
					<p>Frontend: @sedrakyan7</p>
					<p>Backend: @ForThe_Lord</p>
				</div>

				<button
					onClick={handleClose}
					className='bg-purple-700 hover:bg-purple-600 px-20 py-2 rounded-lg transition-all cursor-pointer font-semibold'
				>
					Понятно
				</button>
			</div>
		</div>
	)
}
