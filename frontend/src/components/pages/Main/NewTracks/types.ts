import type { Track } from '../../../context/Audio/types'

export interface NewTracksProps {
	tracks: Track
}

export interface NewTracksItemProps {
	track: Track
	index: number
}