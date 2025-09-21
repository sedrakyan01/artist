import React, { useState } from 'react'
import { Modal } from '../../../ui/Modal/Modal'
import SignIn from '../SignIn/SignIn'
import RegistrationFlow from '../SignUp/RegistrationFlow'
import type { AuthModalProps, AuthMode } from './types'

export const AuthModal: React.FC<AuthModalProps> = ({
	isOpen,
	onClose,
	initialMode = 'login',
	onSuccessfulLogin,
}) => {
	const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode)

	const handleClose = () => {
		setCurrentMode('login')
		onClose()
	}

	const switchToRegister = () => setCurrentMode('register')
	const switchToLogin = () => setCurrentMode('login')

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size='md'>
			{currentMode === 'login' ? (
				<SignIn
					closeLogin={handleClose}
					onSuccessfulLogin={onSuccessfulLogin}
					onSwitchToRegister={switchToRegister}
				/>
			) : (
				<RegistrationFlow
					onClose={handleClose}
					onSwitchToLogin={switchToLogin}
				/>
			)}
		</Modal>
	)
}
