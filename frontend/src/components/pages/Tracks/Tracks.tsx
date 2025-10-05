import { Header } from '../../layouts/Header/Header'
import { SideBar } from '../../layouts/SideBar/SideBar'

import { useTheme } from '../../utils/Theme/hooks/useTheme'

import { TracksComponent } from './TracksComponent/TracksComponent'

export const Tracks = () => {
	const { isDark } = useTheme()
	return (
		<div
			className={`text-white mt-30 flex ${
				isDark ? 'bg-[#18161C]' : 'bg-[#FFF]'
			}`}
		>
			<div className='z-[50]'>
				<SideBar />
			</div>

			<div className='flex-1 ml-[80px] px-8 space-y-8'>
				<Header />
				<TracksComponent />
			</div>
		</div>
	)
}
