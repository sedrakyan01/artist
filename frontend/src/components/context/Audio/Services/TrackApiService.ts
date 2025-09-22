import type { TrackMetadata } from '../types'

import type { NotificationApi } from '../Notifications/NotificationApi'

export class TrackApiService {	
	private baseUrl = 'http://localhost:8080'
	private notify?: NotificationApi

	constructor(notify?: NotificationApi) {
		this.notify = notify
	}

	async fetchTrackMetadata(
		trackId: string,
		token: string
	): Promise<TrackMetadata | null> {
		if (!token || !trackId) {
			throw new Error(
				!token ? 'Токен авторизации отсутствует' : 'Track ID отсутствует'
			)
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/gettrackmetasend?track_id=${trackId}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					credentials: 'include',
				}
			)

			if (!response.ok) {
				const errorMsg =
					response.status === 401
						? 'Unauthorized: Неверный или истекший токен'
						: `Ошибка получения метаданных: ${response.status} ${response.statusText}`
				throw new Error(errorMsg)
			}

			const data: TrackMetadata = await response.json()
			return data
		} catch (error) {
			if (this.notify?.showError) {
				this.notify.showError('Ошибка запроса метаданных:', error)
			} else {
				showError('Ошибка запроса метаданных:', error)
			}
			throw error
		}
	}

	async checkStreamAvailability(
		ownerUsername: string,
		trackId: string,
		token: string
	): Promise<boolean> {
		const streamUrl = `${this.baseUrl}/streammusicsend?username=${ownerUsername}&trackID=${trackId}&startPosition=0`

		const response = await fetch(streamUrl, {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		return response.ok
	}

	getStreamUrl(ownerUsername: string, trackId: string): string {
		return `${this.baseUrl}/streammusicsend?username=${ownerUsername}&trackID=${trackId}&startPosition=0`
	}
}
