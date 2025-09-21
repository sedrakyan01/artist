import { createContext } from 'react'

interface ModalContextType {
	modalStack: Modal[]
	openModal: (modalId: string, config?: ModalConfig) => void
	closeModal: (modalId: string) => void
	closeTopModal: () => void
	closeAllModals: () => void
}

export const ModalContext = createContext<ModalContextType | null>(null)
