export interface ArtistsProps {
	onArtistClick: (artist: Artist) => void
	onArtistHover: (artist: Artist) => void
	onArtistLeave: () => void
	artists: Artist[]
	loading: boolean
	skeletonCount: number
	showError: (error: string) => void
}