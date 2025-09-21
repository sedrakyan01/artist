export interface ButtonProps {
	onNext: () => void
	code: string
	formData: { email: string; hash?: string }
	setFormData: (data: _any) => void
	isLoading?: boolean
	disabled?: boolean
}

export interface NextButtonProps {
	onNext: () => void
	dateFields: DateFields
	formData: { country?: string; birthDate?: string }
	setIsDayEmpty: (value: boolean) => void
	setIsMonthEmpty: (value: boolean) => void
	setIsYearEmpty: (value: boolean) => void
	setIsCountryEmpty: (value: boolean) => void
	validateDate: (day: string, month: string, year: string) => boolean
}
