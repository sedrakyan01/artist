import gsap from 'gsap'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { NotificationProps } from './types'

import { useTheme } from '../../utils/Theme/hooks/useTheme'

export const NotificationItem: React.FC<NotificationProps> = ({
	notification,
	onRemove,
}) => {
	const notificationRef = useRef<HTMLDivElement>(null)
	const iconRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const closeButtonRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		const element = notificationRef.current
		const icon = iconRef.current
		const content = contentRef.current
		const closeButton = closeButtonRef.current

		if (element && icon && content && closeButton) {
			gsap.set(element, {
				x: -400,
				opacity: 1,
				scale: 0.8,
				rotationY: -90,
			})

			gsap.set(icon, {
				scale: 1,
			})

			gsap.set(content, {
				x: 0,
				opacity: 1,
			})

			gsap.set(closeButton, {
				scale: 1,
				rotation: 90,
			})

			const tl = gsap.timeline()

			tl.to(element, {
				x: 0,
				opacity: 1,
				scale: 1,
				rotationY: 0,
				duration: 0.6,
				ease: 'back.out(1.7)',
			})
				.to(
					icon,
					{
						scale: 1,
						rotation: 0,
						duration: 0.4,
						ease: 'back.out(2)',
					},
					'-=0.3'
				)
				.to(
					content,
					{
						x: 0,
						opacity: 1,
						duration: 0.4,
						ease: 'power2.out',
					},
					'-=0.2'
				)
				.to(
					closeButton,
					{
						scale: 1,
						rotation: 0,
						duration: 0.3,
						ease: 'back.out(2)',
					},
					'-=0.1'
				)

				.to(element, {
					keyframes: [
						{ x: 3, scale: 1.01, rotation: 1, duration: 0.05 },
						{ x: -3, scale: 0.99, rotation: -1, duration: 0.05 },
						{ x: 2, scale: 1.01, rotation: 1, duration: 0.05 },
						{ x: -2, scale: 0.99, rotation: -1, duration: 0.05 },
						{ x: 1, scale: 1, rotation: 0.5, duration: 0.05 },
						{ x: 0, scale: 1, rotation: 0, duration: 0.05 },
					],
					ease: 'power1.inOut',
				})
		}
	}, [])

	const getIcon = () => {
		switch (notification.type) {
			case 'error':
				return <AlertCircle className='w-5 h-5 text-[#ff6b6b]' />
			case 'success':
				return <CheckCircle className='w-5 h-5 text-green-500' />
			case 'warning':
				return <AlertTriangle className='w-5 h-5 text-yellow-500' />
			case 'info':
				return <Info className='w-5 h-5 text-[#764FD0]' />
		}
	}

	const getBgColor = () => {
		switch (notification.type) {
			case 'error':
				return 'bg-[#24232B] border-[#ff6b6b]'
			case 'success':
				return 'bg-[#24232B] border-[#1ED760]'
			case 'warning':	
				return 'bg-[#24232B] border-[#FFCC40]'
			case 'info':
				return 'bg-[#24232B] border-[#764FD0]'
		}
	}

	const getBgColorWhiteTheme = () => {
		switch (notification.type) {
			case 'error':
				return 'bg-[#e5e7eb] border-red-500'
			case 'success':
				return 'bg-[#e5e7eb] border-[#1ED760]'
			case 'warning':	
				return 'bg-[#e5e7eb] border-[#FFCC40]'
			case 'info':
				return 'bg-[#e5e7eb] border-[#764FD0]'
		}
	}

	const { isDark } = useTheme()

	return (
		<div
			ref={notificationRef}
			className={`
				${isDark ? `${getBgColor()}` : `${getBgColorWhiteTheme()}`}
				border-l-4 rounded-r-lg shadow-lg p-4 mb-3 
				transform transition-all duration-300 ease-in-out
				animate-slide-in-right max-w-sm
			`}
		>
			<div className='flex items-start'>
				<div className='flex-shrink-0' ref={iconRef}>
					{getIcon()}
				</div>
				<div ref={contentRef} className='ml-3 flex-1'>
					<h3 className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>
						{notification.title}
					</h3>
					{notification.message && (
						<p className={`mt-1 text-sm ${isDark ? "text-white" : "text-black"}`}>{notification.message}</p>
					)}
				</div>
				<button
					ref={closeButtonRef}
					onClick={() => onRemove(notification.id)}
					className='flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
				>
					<X className='w-4 h-4' />
				</button>
			</div>
		</div>
	)
}

export default NotificationItem
