import { X } from 'lucide-react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ModalContext } from '../../context/Modal/ModalContext'
import { MODAL_SIZES } from '../../utils/Data/modalSizes'

import { useTheme } from '../../utils/Theme/hooks/useTheme'

export const ModalProvider = ({ children }) => {
	const [modalStack, setModalStack] = useState([])

	const openModal = useCallback((modalId, config) => {
		setModalStack(prev => [...prev, { id: modalId, ...config }])
	}, [])

	const closeModal = useCallback(modalId => {
		setModalStack(prev => prev.filter(modal => modal.id !== modalId))
	}, [])

	const closeTopModal = useCallback(() => {
		setModalStack(prev => prev.slice(0, -1))
	}, [])

	const closeAllModals = useCallback(() => {
		setModalStack([])
	}, [])

	return (
		<ModalContext.Provider
			value={{
				modalStack,
				openModal,
				closeModal,
				closeTopModal,
				closeAllModals,
			}}
		>
			{children}
			<ModalRenderer />
		</ModalContext.Provider>
	)
}

const ModalRenderer = () => {
	const { modalStack, closeModal } = useContext(ModalContext)

	return (
		<>
			{modalStack.map((modal, index) => (
				<Modal
					key={modal.id}
					id={modal.id}
					isOpen={true}
					onClose={() => closeModal(modal.id)}
					zIndex={1000 + index * 10}
					{...modal}
				/>
			))}
		</>
	)
}

export const Modal = ({
	id,
	isOpen = false,
	onClose,
	children,
	size,
	width,
	height,
	minWidth,
	minHeight,
	maxWidth,
	maxHeight,
	title,
	subtitle,
	showCloseButton = true,
	closeOnOverlayClick = true,
	closeOnEscape = true,
	preventBodyScroll = true,
	overlayClassName = '',
	headerClassName = '',
	contentClassName = '',
	zIndex = 1000,
	animationDuration = 200,
	'aria-label': ariaLabel,
	'aria-labelledby': ariaLabelledBy,
	'aria-describedby': ariaDescribedBy,
	role = 'dialog',
}) => {
	const modalRef = useRef(null)
	const previousFocusRef = useRef(null)

	const sizeConfig = typeof size === 'string' ? MODAL_SIZES[size] : size
	const modalWidth = width || sizeConfig?.width || MODAL_SIZES.md.width
	const modalHeight = height || sizeConfig?.height || MODAL_SIZES.md.height
	const { isDark } = useTheme()

	useEffect(() => {
		if (isOpen) {
			previousFocusRef.current = document.activeElement

			const timer = setTimeout(() => {
				if (modalRef.current) {
					const focusableElement = modalRef.current.querySelector(
						'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
					)
					if (focusableElement) {
						focusableElement.focus()
					} else {
						modalRef.current.focus()
					}
				}
			}, animationDuration)

			return () => clearTimeout(timer)
		} else {
			if (previousFocusRef.current) {
				previousFocusRef.current.focus()
			}
		}
	}, [isOpen, animationDuration])

	useEffect(() => {
		if (!preventBodyScroll) return

		if (isOpen) {
			const scrollY = window.scrollY
			document.body.style.position = 'fixed'
			document.body.style.top = `-${scrollY}px`
			document.body.style.width = '100%'
		} else {
			const scrollY = document.body.style.top
			document.body.style.position = ''
			document.body.style.top = ''
			document.body.style.width = ''
			if (scrollY) {
				window.scrollTo(0, parseInt(scrollY || '0') * -1)
			}
		}

		return () => {
			document.body.style.position = ''
			document.body.style.top = ''
			document.body.style.width = ''
		}
	}, [isOpen, preventBodyScroll])

	useEffect(() => {
		if (!closeOnEscape || !isOpen) return

		const handleEscape = e => {
			if (e.key === 'Escape') {
				e.preventDefault()
				handleClose()
			}
		}

		document.addEventListener('keydown', handleEscape)
		return () => document.removeEventListener('keydown', handleEscape)
	}, [isOpen, closeOnEscape]) // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!isOpen) return

		const handleTabKey = e => {
			if (e.key !== 'Tab' || !modalRef.current) return

			const focusableElements = modalRef.current.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)

			if (focusableElements.length === 0) return

			const firstElement = focusableElements[0]
			const lastElement = focusableElements[focusableElements.length - 1]

			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					e.preventDefault()
					lastElement.focus()
				}
			} else {
				if (document.activeElement === lastElement) {
					e.preventDefault()
					firstElement.focus()
				}
			}
		}

		document.addEventListener('keydown', handleTabKey)
		return () => document.removeEventListener('keydown', handleTabKey)
	}, [isOpen])

	const handleClose = useCallback(() => {
		if (onClose) {
			onClose()
		}
	}, [onClose])

	const handleOverlayClick = useCallback(
		e => {
			if (closeOnOverlayClick && e.target === e.currentTarget) {
				handleClose()
			}
		},
		[closeOnOverlayClick, handleClose]
	)

	if (!isOpen) return null

	const modalStyles = {
		width: typeof modalWidth === 'number' ? `${modalWidth}px` : modalWidth,
		height: typeof modalHeight === 'number' ? `${modalHeight}px` : modalHeight,
		minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
		minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
		maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
		maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
		zIndex: zIndex + 1,
	}

	const overlayStyles = {
		zIndex,
		transitionDuration: `${animationDuration}ms`,
	}

	return (
		<div
			className={`fixed inset-0 flex items-center justify-center p-4 transition-opacity ${
				isOpen ? 'opacity-100' : 'opacity-0'
			} ${overlayClassName}`}
			style={overlayStyles}
			onClick={handleOverlayClick}
			aria-hidden={!isOpen}
		>
			<div className='absolute inset-0 transition-opacity backdrop-blur-xs' />

			<div
				ref={modalRef}
				className={`${
					isDark ? 'bg-[#24232B]' : 'bg-[#fff]'
				} rounded-2xl shadow-2xl relative flex flex-col transform transition-all`}
				style={modalStyles}
				onClick={e => e.stopPropagation()}
				role={role}
				aria-modal='true'
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				aria-describedby={ariaDescribedBy}
				tabIndex={-1}
			>
				{(title || subtitle || showCloseButton) && (
					<div
						className={`flex items-start justify-between border-gray-200 absolute right-0 text-[#C7C7C7] ${headerClassName}`}
					>
						<div className='flex-1'>
							{title && (
								<h2
									id={`${id}-title`}
									className='text-xl font-semibold text-gray-900 mb-1'
								>
									{title}
								</h2>
							)}
							{subtitle && <p className='text-sm text-gray-600'>{subtitle}</p>}
						</div>
						{showCloseButton && (
							<div
								onClick={handleClose}
								className='ml-4 p-3 rounded-full transition-colors focus:outline-none'
								aria-label='Закрыть модальное окно'
							>
								<X size={18} className='cursor-pointer' />
							</div>
						)}
					</div>
				)}

				<div className={`flex-1 mt-4 overflow-auto ${contentClassName}`}>
					{children}
				</div>
			</div>
		</div>
	)
}
