interface LoginProps {
	onErrorChange?: (message: string) => void
	openRegister: () => void
	closeLogin: () => void
	onSuccessfulLogin?: () => void
	onSwitchToRegister?: () => void
}

interface LoginData {
	identifier: string
	password: string
}

export type { LoginData, LoginProps }
