import type { Track } from '../../context/Audio/types'

export interface MiniPlayerProps {
	onTrackClick: (track: Track) => void
	onPlaylistClick: (playlistId: string) => void
	onPlayPause: () => void
	onNextTrack: () => void
	onPreviousTrack: () => void
	onMute: () => void
	onVolumeChange: (volume: number) => void
	currentTrack: Track | null
	currentTrackList: Track[]
	isPlaying: boolean
	isLoading: boolean
}