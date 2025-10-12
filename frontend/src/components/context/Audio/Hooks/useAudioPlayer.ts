import { useCallback, useEffect } from 'react'
import { useNotifications } from '../../../utils/Notification/hooks/useNotification'
import { AudioElementManager } from '../services/audioElementManager'
import { HlsManager } from '../services/hlsManager'
import { TrackApiService } from '../services/trackApiService'
import type { Track } from '../types'

export const useAudioPlayer = (
	token: string | null,
	audioState: ReturnType<typeof import('./useAudioState').useAudioState>
) => {
	const {
		currentTrack,
		setCurrentTrack,
		isPlaying,
		setIsPlaying,
		setIsLoading,
		setUserData,
		setCurrentTime,
		setAudioDuration,
		setCurrentTrackList,
		audioRef,
	} = audioState

	const { showError } = useNotifications()
	const apiService = new TrackApiService()
	const hlsManager = new HlsManager()
	const audioManager = new AudioElementManager()

	useEffect(() => {
		const fetchUserData = async (): Promise<void> => {
			if (!currentTrack?.track_id || !token) return

			try {
				const trackData = await apiService.fetchTrackMetadata(
					currentTrack.track_id,
					token
				)
				if (trackData?.owner) {
					setUserData({ username: trackData.owner })
				} else {
					showError('Не удалось получить владельца трека')
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: 'Ошибка получения данных пользователя'
				console.error('Ошибка получения данных пользователя:', err)
				showError(errorMessage)
			}
		}

		fetchUserData()
	}, [currentTrack, token]) // eslint-disable-line

	const cleanupAudio = useCallback((): void => {
		hlsManager.destroy()
		if (audioRef.current) {
			audioManager.cleanup(audioRef.current)
		}
	}, []) // eslint-disable-line

	const resetTrack = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause()
			audioRef.current.currentTime = 0
			audioRef.current.src = ''
		}
		setCurrentTrack(null)
		setIsPlaying(false)
		setIsLoading(false)
		setCurrentTime(0)
		setAudioDuration(0)
	}, []) // eslint-disable-line

	const playTrack = useCallback(
		async (track: Track): Promise<boolean> => {
			if (!token || !track?.track_id) {
				const errorMsg = !token ? 'Ошибка авторизации' : 'Track ID отсутствует'
				console.error(errorMsg)
				showError(errorMsg)
				return false
			}

			try {
				setIsLoading(true)
				setCurrentTrack(track)

				const trackData = await apiService.fetchTrackMetadata(
					track.track_id,
					token
				)
				if (!trackData?.owner) {
					throw new Error('Не удалось получить информацию о владельце трека')
				}

				const ownerUsername = trackData.owner

				const isStreamAvailable = await apiService.checkStreamAvailability(
					ownerUsername,
					track.track_id,
					token
				)

				if (!isStreamAvailable) {
					throw new Error('Стрим недоступен')
				}

				cleanupAudio()

				if (!audioRef.current) {
					audioRef.current = audioManager.createAudioElement()
				}

				const audio = audioRef.current
				const streamUrl = apiService.getStreamUrl(ownerUsername, track.track_id)

				audioManager.setupAudioHandlers(audio, {
					onLoadStart: () => setIsLoading(true),
					onCanPlay: () => setIsLoading(false),
					onPlay: () => setIsPlaying(true),
					onPause: () => setIsPlaying(false),
					onEnded: () => {
						setIsPlaying(false)
					},
					onError: error => {
						showError(error)
						setIsPlaying(false)
						setIsLoading(false)
					},
					onTimeUpdate: setCurrentTime,
					onLoadedMetadata: setAudioDuration,
					onSeeking: () => setIsLoading(true),
					onSeeked: () => setIsLoading(false),
				})

				if (hlsManager.isSupported()) {
					await hlsManager.setupHls(audio, streamUrl, error => {
						showError(error)
						setIsPlaying(false)
						setIsLoading(false)
					})
				} else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
					await hlsManager.setupNativeHls(audio, streamUrl, error => {
						showError(error)
						setIsPlaying(false)
						setIsLoading(false)
					})
				} else {
					throw new Error('HLS не поддерживается в этом браузере')
				}

				return true
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Неизвестная ошибка'
				console.error('Общая ошибка воспроизведения:', error)
				showError(`Ошибка: ${errorMessage}`)
				setIsPlaying(false)
				setIsLoading(false)
				return false
			}
		},
		[token, cleanupAudio] // eslint-disable-line
	)

	const togglePlayPause = useCallback(
		async (track: Track, tracks: Track[] = []): Promise<void> => {
			const filteredTracks = tracks.filter((t: Track) => t?.track_id)
			if (filteredTracks.length > 0) {
				setCurrentTrackList(filteredTracks)
			}

			if (
				currentTrack?.track_id === track?.track_id &&
				audioRef.current &&
				audioRef.current.src
			) {
				if (isPlaying) {
					audioRef.current.pause()
				} else {
					try {
						await audioRef.current.play()
					} catch (error) {
						const errorMessage =
							error instanceof Error ? error.message : 'Ошибка возобновления'
						showError(`Ошибка возобновления: ${errorMessage}`)
					}
				}
			} else {
				await playTrack(track)
			}
		},
		[currentTrack, isPlaying, playTrack] // eslint-disable-line
	)

	const stopTrack = useCallback((): void => {
		cleanupAudio()
		setCurrentTrack(null)
		setIsPlaying(false)
		setIsLoading(false)
		setCurrentTrackList([])
		setCurrentTime(0)
		setAudioDuration(0)
	}, [cleanupAudio]) // eslint-disable-line

	const handleSeek = useCallback(
		(time: number | string): void => {
			const seekTime = typeof time === 'string' ? parseFloat(time) : time

			if (
				audioRef.current &&
				!isNaN(seekTime) &&
				seekTime >= 0 &&
				seekTime <= (audioState.audioDuration || 0)
			) {
				setCurrentTime(seekTime)

				try {
					audioRef.current.currentTime = seekTime
				} catch (err) {
					console.warn('Ошибка перемотки аудио:', err)
				}
			}
		},
		[audioState.audioDuration, audioRef, setCurrentTime]
	)

	return {
		playTrack,
		togglePlayPause,
		stopTrack,
		resetTrack,
		handleSeek,
	}
}
