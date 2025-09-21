import { Disc3 } from 'lucide-react'

import { PrimaryNav } from './Parts/PrimaryNav'
import { SecondaryNav } from './Parts/SecondaryNav'

export const SideBar = () => {
	return (
		<div className='w-[90px] h-screen fixed top-0'>
			<div className='flex justify-center items-center flex-col'>
				<div className='py-6 ml-1'>
					<Disc3 size={35} className='text-purple-500 cursor-pointer' />
				</div>

				<PrimaryNav />
				<SecondaryNav />
			</div>
		</div>
	)
}
