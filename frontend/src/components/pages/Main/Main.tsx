import { Header } from '../../layouts/Header/Header'
import { SideBar } from '../../layouts/SideBar/SideBar'

import { Genres } from './Genres/Genres'
import { NewTracks } from './NewTracks/NewTracks'

import { useTheme } from '../../utils/Theme/hooks/useTheme'

export const Main = () => {
	const { isDark } = useTheme()
	return (
		<div
			className={`text-white mt-30 h-screen flex ${
				isDark ? 'bg-[#18161C]' : 'bg-[#FFF]'
			}`}
			style={{marginBottom: "350px"}}
		>
			<div className='z-[50]'>
				<SideBar />
			</div>

			<div className='flex-1 ml-[80px] px-8 space-y-8'>
				<Header />
				<Genres />
				<NewTracks />
			</div>
		</div>
	)
}
