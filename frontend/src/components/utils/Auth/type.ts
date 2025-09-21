export interface AuthContextType {
	isUserAuthenticated: boolean
	login: (accessToken: string, refreshToken?: string) => void
	logout: () => void
	refreshAuth: () => void
}

export interface AuthProviderProps {
	children: ReactNode
}
