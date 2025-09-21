export interface FormData {
	email: string
	userName: string
	firstName: string
	artistName: string
	birthDate: string
	country: string
	password: string
	hash: string
}

export interface RegistrationFlowProps {
	onStepChange?: (step: number) => void
	onSuccessChange?: (isSuccess: boolean) => void
	onClose?: () => void
	onSwitchToLogin?: () => void
}

// // //  EmailStep

export interface EmailStepProps {
	onNext: () => void
	formData: FormData
	setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

export interface EmailCheckResponse {
	exists: string | boolean
}

// // //

// // // EmailValidation

export interface EmailValidationProps {
	onNext: () => void
	onBack: () => void
	formData: FormData
	setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

// // //

// // // NameStep

export interface NameStepProps {
	onNext: () => void
	onBack: () => void
	formData: FormData
	setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

// // //

// // // BirthDateStep

export interface BirthDateStepProps {
	onNext: () => void
	onBack: () => void
	formData: FormData
	setFormData: (data: FormData) => void
}

export interface DateFields {
	day: string
	month: string
	year: string
}

export interface MonthOption {
	value: string
	label: string
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

// // //

// // // PasswordStep

export interface PasswordStepProps {
	onNext: (e: FormEvent<HTMLFormElement>) => Promise<void>
	onBack: () => void
	formData: FormData
	setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

// // //
