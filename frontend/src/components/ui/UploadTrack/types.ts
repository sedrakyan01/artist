export interface TrackMeta {
	title: string
	artist_name: string
	genre: string
	album_name: string
	release_year: number
	description: string
}

export interface UploadedTrack {
	title: string
	artist_name: string
	album_name: string
	genre: string
	release_year: number
	description: string
	cover_url: string | null
	server_message: string
}

export interface UploadTrackProps {
	onUploadSuccess: (track: UploadedTrack) => void
}

export interface LoadingState {
	isFetchingUser: boolean
	isUploading: boolean
	error: string | null
}
