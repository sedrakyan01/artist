const BASE_URL = 'http://localhost:8080'

export const API_ENDPOINTS = {
	VERIFY_CODE: (email: string, code: string) =>
		`${BASE_URL}/registerсodeсheck?email=${encodeURIComponent(
			email
		)}&code=${encodeURIComponent(code)}`,
} as const
