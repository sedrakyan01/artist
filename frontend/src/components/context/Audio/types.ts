import type { MutableRefObject, ReactNode } from 'react'

interface Track {
	track_id: string
	track_picture?: string
	title: string
	artist_name?: string
	duration: number
	genre?: string
	release_year?: string
	likes?: number
	id: string
}

interface TrackMetadata {
	owner: string
	track_id: string
	title?: string
	artist_name?: string
	duration?: number
	genre?: string
	release_year?: string
	likes?: number
}

type AudioError = string | null

type PlayTrackFunction = (track: Track) => Promise<boolean>
type TogglePlayPauseFunction = (track: Track, tracks: Track[]) => Promise<void>
type StopTrackFunction = () => void
type PlayNextTrackFunction = () => void
type PlayPreviousTrackFunction = () => void
type HandleSeekFunction = (time: number | string) => void

interface AudioContextType {
	resetTrack: () => void
	currentTrack: Track | null
	isPlaying: boolean
	isLoading: boolean
	userData: UserData
	currentTrackList: Track[]
	playTrack: PlayTrackFunction
	togglePlayPause: TogglePlayPauseFunction
	stopTrack: StopTrackFunction
	playNextTrack: PlayNextTrackFunction
	playPreviousTrack: PlayPreviousTrackFunction
	audioRef: MutableRefObject<HTMLAudioElement | null>
	currentTime: number
	audioDuration: number
	handleSeek: HandleSeekFunction
}

interface AudioProviderProps {
	children: ReactNode
}

interface UserData {
	username?: string
}

export type {
	AudioContextType,
	AudioError,
	AudioProviderProps,
	HandleSeekFunction,
	PlayNextTrackFunction,
	PlayPreviousTrackFunction,
	PlayTrackFunction,
	StopTrackFunction,
	TogglePlayPauseFunction,
	Track,
	TrackMetadata,
	UserData,
}
