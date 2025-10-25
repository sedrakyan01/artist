
interface Track {
	artist_name: string
	title: string
	album_name: string
	genre: string
	description: string
	duration: number
	release_year: number
	add_to_db_date: string
	owner: string
	likes: number
	plays: number
	track_picture: string
	track_id: number
}

interface PlaylistDetails {
	name: string
	owner: string
	status: string
	tracks: Track[]
}

export type { Track, PlaylistDetails }