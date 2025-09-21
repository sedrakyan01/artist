import React, { useCallback, useEffect, useRef, useState } from 'react'

import { maxFileSizeMB } from './Components/constants'
import { RenderStepIndicator } from './Components/renderStepIndicator'

import { RenderStep4 } from './Steps/StepFour'
import { RenderStep1 } from './Steps/StepOne'
import { RenderStep3 } from './Steps/StepThree'
import { RenderStep2 } from './Steps/StepTwo'

import { useNotifications } from '../../utils/Notification/hooks/useNotification'

export const UploadTrack: React.FC<UploadTrackProps> = ({
	onUploadSuccess,
}) => {
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [trackFile, setTrackFile] = useState<File | null>(null)
	const [coverFile, setCoverFile] = useState<File | null>(null)
	const [previewCover, setPreviewCover] = useState<string | null>(null)
	const [trackMeta, setTrackMeta] = useState<TrackMeta>({
		title: '',
		artist_name: '',
		genre: '',
		album_name: '',
		release_year: new Date().getFullYear(),
		description: '',
	})
	const [loadingState, setLoadingState] = useState<LoadingState>({
		isFetchingUser: true,
		isUploading: false,
		error: null,
	})
	const [uploadProgress, setUploadProgress] = useState<number>(0)
	const [uploadedTrack, setUploadedTrack] = useState<UploadedTrack | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const imageInputRef = useRef<HTMLInputElement>(null)
	const token = localStorage.getItem('accessToken')

	const isInterfaceDisabled =
		loadingState.isUploading || loadingState.isFetchingUser

	const { showError, showSuccess } = useNotifications()

	const fetchUserData = useCallback(async () => {
		if (!token) {
			setLoadingState({
				isFetchingUser: false,
				isUploading: false,
			})
			showError(
				'Ошибка получения данных пользователя',
				'Токен отсутствует, пожалуйста войдите'
			)
			return
		}

		setLoadingState(prev => ({ ...prev, isFetchingUser: true }))

		try {
			const response = await fetch('http://localhost:8080/getuserdatasend', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
				body: JSON.stringify(['artistName']),
			})

			if (!response.ok) {
				throw new Error(
					response.status === 401
						? 'Unauthorized: Неверный или истекший токен'
						: 'Ошибка получения данных пользователя'
				)
			}

			const data = await response.json()
			const artistName = Array.isArray(data) ? data[0] : data.artistName || ''
			setTrackMeta(prev => ({
				...prev,
				artist_name: artistName || 'Unknown Artist',
			}))
			setLoadingState(prev => ({ ...prev, isFetchingUser: false, error: null }))
		} catch (error) {
			showError('Ошибка получения данных пользователя:', error)
			setLoadingState(prev => ({
				...prev,
				isFetchingUser: false,
			}))
		}
	}, [token]) // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		fetchUserData()
	}, [fetchUserData])

	const handleTrackChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			if (file && file.type.startsWith('audio/')) {
				setTrackFile(file)
				setCurrentStep(2)
			}
		},
		[]
	)

	const handleCoverChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			if (file && file.type.startsWith('image/')) {
				setCoverFile(file)
				const reader = new FileReader()
				reader.onloadend = () => setPreviewCover(reader.result as string)
				reader.readAsDataURL(file)
			}
		},
		[]
	)

	const handleMetaChange = useCallback(
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			>
		) => {
			const { name, value } = e.target
			setTrackMeta(prev => ({
				...prev,
				[name]:
					name === 'release_year'
						? parseInt(value) || prev.release_year
						: value,
			}))
		},
		[]
	)

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()

			if (isInterfaceDisabled) return

			if (!trackFile) {
				setLoadingState(prev => ({
					...prev,
				}))
				showError('Ошибка загрузки трека', 'Пожалуйста, выберите аудио файл')
				return
			}

			if (!coverFile) {
				setLoadingState(prev => ({
					...prev,
				}))
				showError(
					'Ошибка загрузки трека',
					'Пожалуйста, выберите изображение обложки'
				)
				return
			}

			if (!trackMeta.title || !trackMeta.artist_name) {
				setLoadingState(prev => ({
					...prev,
				}))
				showError(
					'Ошибка загрузки трека',
					'Название трека и имя исполнителя обязательны'
				)
				return
			}

			setLoadingState(prev => ({ ...prev, isUploading: true }))
			setUploadProgress(0)

			const interval = setInterval(() => {
				setUploadProgress(prev => (prev >= 90 ? prev : prev + 10))
			}, 500)

			try {
				const formData = new FormData()
				formData.append('track_file', trackFile)
				formData.append('picture_file', coverFile)
				formData.append('meta_data', JSON.stringify(trackMeta))

				const response = await fetch('http://localhost:8080/uploadmusicsend', {
					method: 'POST',
					headers: { Authorization: `Bearer ${token}` },
					credentials: 'include',
					body: formData,
				})

				clearInterval(interval)
				setUploadProgress(100)

				if (!response.ok) {
					throw new Error(`Ошибка: ${response.status} ${response.statusText}`)
				}

				if (trackFile && trackFile.size / 1024 / 1024 > maxFileSizeMB) {
					setLoadingState(prev => ({
						...prev,
					}))
					showError(
						'Ошибка загрузки трека',
						`Размер файла превышает ${maxFileSizeMB} МБ`
					)
					return
				}
				if (
					coverFile &&
					!['image/jpeg', 'image/png'].includes(coverFile.type)
				) {
					setLoadingState(prev => ({
						...prev,
					}))
					showError(
						'Ошибка загрузки трека',
						'Обложка должна быть в формате JPEG или PNG'
					)
					return
				}

				const trackData: UploadedTrack = {
					title: trackMeta.title,
					artist_name: trackMeta.artist_name,
					album_name: trackMeta.album_name,
					genre: trackMeta.genre,
					release_year: trackMeta.release_year,
					description: trackMeta.description,
					cover_url: previewCover,
					server_message: 'Трек успешно загружен',
				}

				setUploadedTrack(trackData)
				showSuccess("Успешно", "Трек успешно загружен")
				setTimeout(() => {
					setCurrentStep(5)
					onUploadSuccess(trackData)
				}, 500)
			} catch (error) {
				showError('Ошибка загрузки:', error)
				setLoadingState(prev => ({
					...prev,
				}))
				clearInterval(interval)
			} finally {
				setLoadingState(prev => ({ ...prev, isUploading: false }))
			}
		},
		[trackFile, coverFile, trackMeta, token, previewCover, onUploadSuccess] // eslint-disable-line react-hooks/exhaustive-deps
	)

	return (
		<div className='mt-12'>
			<>
				<h2 className='text-2xl font-bold text-white text-center mb-6'>
					{currentStep === 1 && 'Выбор трека'}
					{currentStep === 2 && 'Информация о треке'}
					{currentStep === 3 && 'Детали трека'}
					{currentStep === 4 && 'Публикация трека'}
				</h2>
				{currentStep < 5 && <RenderStepIndicator currentStep={currentStep} />}
				<div className='rounded-lg p-6'>
					{currentStep === 1 && (
						<RenderStep1
							fileInputRef={fileInputRef}
							handleTrackChange={handleTrackChange}
						/>
					)}
				</div>
				{currentStep === 2 && (
					<RenderStep2
						setCurrentStep={setCurrentStep}
						previewCover={previewCover}
						setLoadingState={setLoadingState}
						loadingState={loadingState}
						trackMeta={trackMeta}
						imageInputRef={imageInputRef}
						handleCoverChange={handleCoverChange}
						handleMetaChange={handleMetaChange}
						setCoverFile={setCoverFile}
						setPreviewCover={setPreviewCover}
					/>
				)}
				{currentStep === 3 && (
					<RenderStep3
						setCurrentStep={setCurrentStep}
						loadingState={loadingState}
						trackMeta={trackMeta}
						previewCover={previewCover}
						handleMetaChange={handleMetaChange}
					/>
				)}
				{currentStep === 4 && (
					<RenderStep4
						handleSubmit={handleSubmit}
						uploadProgress={uploadProgress}
						setLoadingState={setLoadingState}
						loadingState={loadingState}
						trackFile={trackFile}
						trackMeta={trackMeta}
						previewCover={previewCover}
						setCurrentStep={setCurrentStep}
						disabled={isInterfaceDisabled}
					/>
				)}
				{currentStep === 5 && renderStep5()}
				{currentStep === 1 && (
					<p className='text-sm text-gray-400 mt-4 text-center'>
						Продолжая, вы соглашаетесь с нашими <br />{' '}
						<a
							href='#'
							className='font-semibold text-[#A855F7] hover:underline'
						>
							Условиями обслуживания
						</a>{' '}
						и{' '}
						<a
							href='#'
							className='font-semibold text-[#A855F7] hover:underline'
						>
							Политикой конфиденциальности
						</a>
						.
					</p>
				)}
			</>
		</div>
	)
}
