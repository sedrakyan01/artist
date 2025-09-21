export interface RenderStep1Props {
	fileInputRef: React.RefObject<HTMLInputElement>
	handleTrackChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface RenderStep2Props {
	setCurrentStep: (step: number) => void
	setLoadingState: (loadingState: LoadingState) => void
	loadingState: LoadingState
	trackMeta: TrackMeta
	previewCover: string | null
	imageInputRef: React.RefObject<HTMLInputElement>
	handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	handleMetaChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	setCoverFile: (file: File | null) => void
	setPreviewCover: (previewCover: string | null) => void
}

export interface RenderStep3Props {
	setCurrentStep: (step: number) => void
	loadingState: LoadingState
	trackMeta: TrackMeta
	previewCover: string | null
	handleMetaChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface RenderStep4Props {
	setCurrentStep: (step: number) => void
	loadingState: LoadingState
	trackFile: File | null
	trackMeta: TrackMeta
	previewCover: string | null
	handleSubmit: () => void
}
