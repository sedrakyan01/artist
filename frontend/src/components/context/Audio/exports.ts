import { createContext, useContext } from 'react'

import type { AudioContextType } from './types'

export const AudioContext = createContext<AudioContextType | undefined>(
	undefined
)

export const useAudioContext = (): AudioContextType => {
	const context = useContext(AudioContext)
	if (context === undefined) {
		throw new Error('useAudioContext must be used within an AudioProvider')
	}
	return context
}