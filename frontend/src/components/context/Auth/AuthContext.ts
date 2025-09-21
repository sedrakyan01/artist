import type { AuthContextType } from '../../utils/Auth/type'
import { createContext } from 'react'

export const AuthContext = createContext<AuthContextType | null>(null)
