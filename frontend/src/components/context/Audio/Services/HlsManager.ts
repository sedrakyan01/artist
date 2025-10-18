import type { ErrorData } from 'hls.js'
import Hls, { Events } from 'hls.js'

export class HlsManager {
	private hls: Hls | null = null

	isSupported(): boolean {
		return Hls.isSupported()
	}

	async setupHls(
		audio: HTMLAudioElement,
		streamUrl: string,
		onError: (error: string) => void
	): Promise<void> {
		if (this.hls) {
			this.destroy()
		}

		this.hls = new Hls({
			debug: false,
			enableWorker: true,
			lowLatencyMode: false,
			backBufferLength: 90,
		})

		this.hls.on(Events.MANIFEST_PARSED, async () => {
			try {
				await audio.play()
			} catch (playError) {
				const maybeError = playError as
					| Error
					| { name?: string; message?: string }
				const isInterrupted =
					maybeError &&
					(maybeError.name === 'AbortError' ||
						/interrupted/i.test(String(maybeError.message)))
				if (isInterrupted) {
					console.debug('HLS play() interrupted by user pause - ignoring')
				} else {
					const errorMessage =
						maybeError instanceof Error
							? maybeError.message
							: 'Ошибка запуска HLS'
					onError(`Ошибка запуска: ${errorMessage}`)
				}
			}
		})

		this.hls.on(Events.ERROR, (event: Events.ERROR, data: ErrorData) => {
			if (data.fatal) {
				onError(`Критическая HLS ошибка: ${data.details} (${data.reason})`)
				this.destroy()
			}
		})

		this.hls.attachMedia(audio)
		this.hls.loadSource(streamUrl)
	}

	async setupNativeHls(
		audio: HTMLAudioElement,
		streamUrl: string,
		onError: (error: string) => void
	): Promise<void> {
		audio.src = streamUrl
		try {
			await audio.play()
		} catch (playError) {
			const errorMessage =
				playError instanceof Error ? playError.message : 'Ошибка нативного HLS'
			onError(`Ошибка воспроизведения: ${errorMessage}`)
		}
	}

	destroy(): void {
		if (this.hls) {
			this.hls.destroy()
			this.hls = null
		}
	}
}
