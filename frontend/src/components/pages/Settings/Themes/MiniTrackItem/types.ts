export interface TrackItemProps {
	username: string
	track: Track
	index: number
	tracks: Track[]
	onTrackDeleted?: (trackID: string) => void
	openLogin?: () => void
	isUserAuthenticated?: boolean
}