export class AudioElementManager {
	setupAudioHandlers(
		audio: HTMLAudioElement,
		callbacks: {
			onLoadStart: () => void
			onCanPlay: () => void
			onPlay: () => void
			onPause: () => void
			onEnded: () => void
			onError: (error: string) => void
			onTimeUpdate: (currentTime: number) => void
			onLoadedMetadata: (duration: number) => void
			onSeeking: () => void
			onSeeked: () => void
		}
	): void {

		audio.addEventListener('loadstart', callbacks.onLoadStart)
		audio.addEventListener('canplay', callbacks.onCanPlay)
		audio.addEventListener('play', callbacks.onPlay)
		audio.addEventListener('pause', callbacks.onPause)
		audio.addEventListener('ended', callbacks.onEnded)

		audio.addEventListener('error', (event: Event) => {
			const target = event.target as HTMLAudioElement
			const errorMessage = target.error?.message || 'Неизвестная ошибка'
			callbacks.onError(`Ошибка воспроизведения: ${errorMessage}`)
		})

		audio.addEventListener('timeupdate', () => {
			callbacks.onTimeUpdate(audio.currentTime)
		})

		audio.addEventListener('loadedmetadata', () => {
			callbacks.onLoadedMetadata(audio.duration || 0)
		})

		audio.addEventListener('seeking', callbacks.onSeeking)
		audio.addEventListener('seeked', callbacks.onSeeked)
	}

	createAudioElement(): HTMLAudioElement {
		const audio = new Audio()
		audio.preload = 'auto'
		audio.crossOrigin = 'use-credentials'
		return audio
	}

	cleanup(audio: HTMLAudioElement): void {
		audio.pause()
		audio.removeAttribute('src')
		audio.load()
	}
}
