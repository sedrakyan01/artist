import { useCallback } from 'react'
import type { TogglePlayPauseFunction, Track } from '../types'

export const usePlaylistControls = (
	currentTrack: Track | null,
	currentTrackList: Track[],
	togglePlayPause: TogglePlayPauseFunction,
	stopTrack: () => void
) => {
	const playNextTrack = useCallback((): void => {
		if (!currentTrack || currentTrackList.length === 0) {
			stopTrack()
			return
		}

		const currentIndex = currentTrackList.findIndex(
			(track: Track) => track.track_id === currentTrack.track_id
		)
		const nextIndex = (currentIndex + 1) % currentTrackList.length
		const nextTrack = currentTrackList[nextIndex]

		if (nextTrack?.track_id) {
			togglePlayPause(nextTrack, currentTrackList)
		} else {
			stopTrack()
		}
	}, [currentTrack, currentTrackList, togglePlayPause, stopTrack])

	const playPreviousTrack = useCallback((): void => {
		if (!currentTrack || currentTrackList.length === 0) {
			stopTrack()
			return
		}

		const currentIndex = currentTrackList.findIndex(
			(track: Track) => track.track_id === currentTrack.track_id
		)
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
