export interface Track {
	track_id: number
	title: string
	artist: string
	plays: number
	duration: number
}

export interface TrackItemProps {
	track: Track
	index: number
}