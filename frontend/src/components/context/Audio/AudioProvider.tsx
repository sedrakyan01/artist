import React from 'react'
import { useAudioPlayer } from './Hooks/useAudioPlayer'
import { useAudioState } from './Hooks/useAudioState'
import { useAuthToken } from './Hooks/useAuthToken'
import { usePlaylistControls } from './Hooks/usePlaylistControls'
import { AudioContext } from './exports'
import type { AudioContextType, AudioProviderProps } from './types'

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
	const { token } = useAuthToken()
	const audioState = useAudioState()
	const { playTrack, togglePlayPause, stopTrack, resetTrack, handleSeek } =
		useAudioPlayer(token, audioState)
	const { playNextTrack, playPreviousTrack } = usePlaylistControls(
		audioState.currentTrack,
		audioState.currentTrackList,
		togglePlayPause,
		stopTrack
	)

	const value: AudioContextType = {
		currentTrack: audioState.currentTrack,
		isPlaying: audioState.isPlaying,
		isLoading: audioState.isLoading,
		userData: audioState.userData,
		currentTrackList: audioState.currentTrackList,
		playTrack,
		togglePlayPause,
		stopTrack,
		playNextTrack,
		resetTrack,
		playPreviousTrack,
		audioRef: audioState.audioRef,
		currentTime: audioState.currentTime,
		audioDuration: audioState.audioDuration,
		handleSeek,
	}

	return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}
