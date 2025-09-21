export type AuthMode = 'login' | 'register'

export interface AuthModalProps {
	isOpen: boolean
	onClose: () => void
	initialMode?: AuthMode
	onSuccessfulLogin?: () => void
}