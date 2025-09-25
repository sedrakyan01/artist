import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../../context/Auth/AuthContext'
import Divider, { DividerOr } from '../../../ui/Divider/Divider'
import { useNotifications } from '../../../utils/Notification/hooks/useNotification'
import type { LoginData, LoginProps } from './types'

import { fetchNewTracks } from '../../../utils/Fetch/NewTracks/FetchNewTracks'

import { useTheme } from '../../../utils/Theme/hooks/useTheme'

const SignIn: React.FC<LoginProps> = ({
	closeLogin,
	onSuccessfulLogin,
	onSwitchToRegister,
}) => {
	const [loginData, setLoginData] = useState<LoginData>({
		identifier: '',
		password: '',
	})

	const { isDark } = useTheme()

	const { login } = useContext(AuthContext)

	const [isEmail, setIsEmail] = useState<boolean>(true)
	const [loading, setLoading] = useState<boolean>(false)

	const { showError } = useNotifications()

	const updateError = (errorMessage: string) => {
		if (errorMessage) {
			showError('Ошибка авторизации', errorMessage)
		}
	}

	const checkRefreshToken = (): boolean => {
		const cookies = document.cookie.split(';').map(cookie => cookie.trim())
		const refreshTokenCookie = cookies.find(cookie =>
			cookie.startsWith('refresh_token=')
		)
		return !!refreshTokenCookie
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)
		updateError('')

		try {
			const response = await fetch('http://localhost:8080/signinsend', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: isEmail ? loginData.identifier : '',
					username: !isEmail ? loginData.identifier : '',
					password: loginData.password,
				}),
				credentials: 'include',
			})

			const data = await response.json()

			if (!response.ok) {
				if (data.answer === 'wrong password') {
					updateError('Неверные данные для входа')
				} else if (
					data.answer === 'email does not exist' ||
					data.answer === 'username does not exist'
				) {
					updateError(
						'Пользователь с такими данными не найден, пожалуйста попробуйте еще раз'
					)
				} else {
					updateError('Авторизация не удалась')
				}
				return
			}

			const accessTokenHeader = response.headers.get('Authorization')
			if (accessTokenHeader) {
				const accessToken = accessTokenHeader.replace('Bearer ', '')

				let refreshToken: string | undefined
				if (checkRefreshToken()) {
					const cookies = document.cookie
						.split(';')
						.map(cookie => cookie.trim())
					const refreshTokenCookie = cookies.find(cookie =>
						cookie.startsWith('refresh_token=')
					)
					if (refreshTokenCookie) {
						refreshToken = refreshTokenCookie.split('=')[1]
						localStorage.setItem('hasRefreshToken', 'true')
					}
				}

				await login(accessToken, refreshToken)

				closeLogin()
				onSuccessfulLogin?.()
				try {
					const tracks = await fetchNewTracks()
					console.log('Получили новые треки:', tracks)
				} catch (err) {
					console.error('Не удалось получить новые треки:', err)
				}
			} else {
				throw new Error('No access token received')
			}
		} catch (err) {
			updateError('Произошла ошибка. Попробуйте снова.')
			localStorage.removeItem('accessToken')
			localStorage.removeItem('hasRefreshToken')
			console.error('Login failed:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLoginData({
			...loginData,
			[e.target.name]: e.target.value,
		})
	}

	const toggleIdentifierType = () => {
		setIsEmail(!isEmail)
		updateError('')
		setLoginData({
			...loginData,
			identifier: '',
		})
	}

	return (
		<div className='flex items-center w-[520px] m-auto justify-center flex-col font-roboto text-white'>
			<Divider text='Авторизоваться' />
			<DividerOr />
			<form onSubmit={handleSubmit} className='w-full'>
				<div className='m-auto flex gap-2 flex-col'>
					<label className='text-white'>
						{isEmail ? 'Электронная почта' : 'Имя пользователя'}{' '}
					</label>
					<input
						type={isEmail ? 'email' : 'text'}
						name='identifier'
						value={loginData.identifier}
						placeholder={isEmail ? 'name@domain.com' : 'имя пользователя'}
						onChange={handleInputChange}
						className={`${
							isDark
								? 'bg-[#33313B] text-white  placeholder-[#7C7C7C]'
								: 'bg-[#E5E7EB] placeholder-[#7C7C7C] text-black'
						} pt-2 pb-2 pl-4 pr-2 rounded m-auto w-full h-[55px] mb-2 ssm:w-[270px] mt-0 outline-none hover:ring-2 hover:ring-purple-600 focus:ring-2 focus:ring-purple-600 transition-all duration-300'
						required`}
					/>
					<button
						type='button'
						onClick={toggleIdentifierType}
						className={`text-sm mb-2 text-left ${
							isDark ? 'text-[#C7C7C7]' : 'text-black'
						}`}
					>
						Войти через{' '}
						<span
							className={`font-semibold ${
								isDark ? 'text-purple-400' : 'text-purple-600'
							}`}
						>
							{isEmail ? 'имя пользователя' : 'электронную почту'}
						</span>
					</button>
					<div>
						<label className='block text-white'>Пароль</label>
						<input
							type='password'
							name='password'
							placeholder='******'
							value={loginData.password}
							onChange={handleInputChange}
							className={`${
								isDark
									? 'bg-[#33313B] text-white  placeholder-[#7C7C7C]'
									: 'bg-[#E5E7EB] placeholder-[#7C7C7C] text-black'
							} pt-2 pb-2 pl-4 pr-2 rounded m-auto w-full h-[55px] mb-2 placeholder-[#7C7C7C] mt-2 outline-none hover:ring-2 hover:ring-purple-600 focus:ring-2 focus:ring-purple-600 transition-all duration-300`}
							required
						/>
						<Link
							to='/passwordchange'
							className={`text-sm ${
								isDark ? 'text-[#C7C7C7]' : 'text-black'
							} mb-2`}
						>
							Забыли пароль?
						</Link>
					</div>

					<div className='flex flex-col'>
						<button
							type='submit'
							disabled={loading}
							className='w-full mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 mt-2 cursor-pointer rounded-2xl p-3 font-semibold ssm:w-[270px] m-auto button'
						>
							{loading ? 'Входим...' : 'Войти'}
						</button>
					</div>
				</div>
				<div className='flex justify-center flex-col items-center'>
					<hr className='border-transparent w-[320px] mt-2 mb-0' />
				</div>

				<div className='text-center m-auto'>
					<span
						className={`mt-0 text-center text-sm ${
							isDark ? 'text-[#C7C7C7]' : 'text-black'
						}`}
					>
						Нет аккаунта?{' '}
					</span>
					<span
						className={`underline text-sm underline-offset-4 cursor-pointer ${
							isDark
								? 'text-[#fff] hover:text-purple-400 '
								: 'text-black hover:text-purple-600 '
						} transition-colors`}
						onClick={onSwitchToRegister}
					>
						Зарегистрируйтесь
					</span>
				</div>
			</form>
		</div>
	)
}

export default SignIn
