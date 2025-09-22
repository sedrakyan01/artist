import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { AudioProvider } from './components/context/Audio/AudioProvider.tsx'

import { AuthProvider } from './components/utils/Auth/AuthProvider'

import { NotificationProvider } from './components/utils/Notification/NotProvider'

import { ThemeProvider } from './components/utils/Theme/Theme'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider>
			<AuthProvider>
				<NotificationProvider>
					<AudioProvider>
						<App />
					</AudioProvider>
				</NotificationProvider>
			</AuthProvider>
		</ThemeProvider>
	</StrictMode>
)
