import { useCallback } from 'react'
import type { TogglePlayPauseFunction, Track } from '../types'

export const usePlaylistControls = (
	currentTrack: Track | null,
	currentTrackList: Track[],
	togglePlayPause: TogglePlayPauseFunction,
	stopTrack: () => void
) => {
	const playNextTrack = useCallback((): void => {
		console.log('playNextTrack called', { currentTrack, currentTrackList })

		if (!currentTrack || currentTrackList.length === 0) {
			console.log('No current track or empty playlist')
			stopTrack()
			return
		}

		const currentIndex = currentTrackList.findIndex(
			(track: Track) => track.track_id === currentTrack.track_id
		)

		if (currentIndex === -1) {
			console.log('Current track not found in playlist')
			stopTrack()
			return
		}

		const nextIndex = (currentIndex + 1) % currentTrackList.length
		const nextTrack = currentTrackList[nextIndex]

		if (nextTrack?.track_id) {
			// ИСПРАВЛЕНИЕ: Передаем currentTrackList как второй параметр
			togglePlayPause(nextTrack, currentTrackList)
		} else {
			stopTrack()
		}
	}, [currentTrack, currentTrackList, togglePlayPause, stopTrack])

	const playPreviousTrack = useCallback((): void => {
		console.log('playPreviousTrack called', { currentTrack, currentTrackList })

		if (!currentTrack || currentTrackList.length === 0) {
			console.log('No current track or empty playlist')
			stopTrack()
			return
		}

		const currentIndex = currentTrackList.findIndex(
			(track: Track) => track.track_id === currentTrack.track_id
		)

		if (currentIndex === -1) {
			console.log('Current track not found in playlist')
			stopTrack()
			return
		}

		const previousIndex =
			currentIndex === 0 ? currentTrackList.length - 1 : currentIndex - 1
		const previousTrack = currentTrackList[previousIndex]

		if (previousTrack?.track_id) {
			togglePlayPause(previousTrack, currentTrackList)
		} else {
			stopTrack()
		}	
	}, [currentTrack, currentTrackList, togglePlayPause, stopTrack])

	return { playNextTrack, playPreviousTrack }
}
