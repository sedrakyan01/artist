import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from 'react-router-dom'

import { ProtectedRoute } from './components/utils/ProtectedRoute/ProtectedRoute'

import { Main } from './components/pages/Main/Main'
import { Profile } from './components/pages/Profile/Profile'
import { Settings } from './components/pages/Settings/Settings'
import { Tracks } from './components/pages/Tracks/Tracks'

import { MiniPlayer } from './components/layouts/MiniPlayer/MiniPlayer'

function App() {
	return (
		<div>
			<Router>
				<Routes>
					<Route path='/' element={<Main />} />
					<Route
						path='/settings'
						element={
							<ProtectedRoute>
								<Settings />
							</ProtectedRoute>
						}
					></Route>
					<Route
						path='/profile'
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/tracks'
						element={
							<ProtectedRoute>
								<Tracks />
							</ProtectedRoute>
						}
					/>
					<Route path='*' element={<Navigate to='/' />} />
				</Routes>
				<MiniPlayer />
			</Router>
		</div>
	)
}

export default App
