import { useContext, useState } from 'react'
import { ModalContext } from '../../../context/Modal/ModalContext'

export const useModal = modalId => {
	const context = useContext(ModalContext)
	const [localIsOpen, setLocalIsOpen] = useState(false)

	if (context) {
		const { modalStack, openModal, closeModal } = context
		const isOpen = modalStack.some(modal => modal.id === modalId)

		return {
			isOpen,
			openModal: (config = {}) => openModal(modalId, config),
			closeModal: () => closeModal(modalId),
			toggleModal: (config = {}) => {
				if (isOpen) {
					closeModal(modalId)
				} else {
					openModal(modalId, config)
				}
			},
		}
	}

	return {
		isOpen: localIsOpen,
		openModal: () => setLocalIsOpen(true),
		closeModal: () => setLocalIsOpen(false),
		toggleModal: () => setLocalIsOpen(!localIsOpen),
	}
}
