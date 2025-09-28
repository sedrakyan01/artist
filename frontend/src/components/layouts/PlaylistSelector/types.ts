interface Playlist {
	id?: string
	name: string
	trackCount?: number
	totalTracks?: number
	tracksCount?: number
	description?: string
	status?: string
}

interface Track {
	track_id: string
	title: string
	artist_name: string
	duration: number
	track_picture?: string
}

interface PlaylistSelectorProps {
	track: Track
	onClose: () => void
	onAddToPlaylist: (playlistId: string, track: Track) => Promise<void>
}

export type { Playlist, Track, PlaylistSelectorProps }