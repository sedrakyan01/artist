import { useTheme } from '../../utils/Theme/hooks/useTheme'

import { Header } from '../../layouts/Header/Header'
import { SideBar } from '../../layouts/SideBar/SideBar'

import { PlaylistsItem } from './PlaylistsItem'

export const Playlists = () => {
	const { isDark } = useTheme()
	return (
		<div
			className={`text-white mt-30 flex ${
				isDark ? 'bg-[#18161C]' : 'bg-[#FFF]'
			}`}
			style={{ marginBottom: '120px' }}
		>
			<div className='z-[50]'>
				<SideBar />
			</div>

			<div className='flex-1 ml-[80px] px-8 space-y-8'>
				<Header />
				<PlaylistsItem />
			</div>
		</div>
	)
}
