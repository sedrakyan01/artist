import { useRef, useState } from 'react'
import type { Track, UserData } from '../types'

export const useAudioState = () => {
	const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
	const [isPlaying, setIsPlaying] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [userData, setUserData] = useState<UserData>({})
	const [currentTime, setCurrentTime] = useState<number>(0)
	const [audioDuration, setAudioDuration] = useState<number>(0)
	const [currentTrackList, setCurrentTrackList] = useState<Track[]>([])
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const hlsRef = useRef<Hls | null>(null)

	return {
		currentTrack,
		setCurrentTrack,
		isPlaying,
		setIsPlaying,
		isLoading,
		setIsLoading,
		userData,
		setUserData,
		currentTime,
		setCurrentTime,
		audioDuration,
		setAudioDuration,
		currentTrackList,
		setCurrentTrackList,
		audioRef,
		hlsRef,
	}
}
