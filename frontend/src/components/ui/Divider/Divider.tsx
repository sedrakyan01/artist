import 'react-tooltip/dist/react-tooltip.css'

import { useTheme } from '../../utils/Theme/hooks/useTheme'

export const DividerOr = () => {
	const { isDark } = useTheme()
	return (
		<div className='flex items-center w-full my-2'>
			<hr className='flex-grow border-t border-[#393844]' />
			<span
				className={`mx-3 ${
					isDark ? 'text-[#88889a]' : 'text-black'
				} font-semibold select-none`}
				style={{ fontSize: '16px' }}
			>
				ИЛИ
			</span>
			<hr className='flex-grow border-t border-[#393844]' />
		</div>
	)
}

type DividerProps = {
	text: string
}

const Divider: React.FC<DividerProps> = () => {
	const { isDark } = useTheme()
	return (
		<div className='w-full my-4'>
			<div>
				<div className='mb-[10px]'></div>
				<div className={`flex justify-center flex-col items-center`}>
					<button
						className={`w-full h-[50px] cursor-pointer ${
							isDark ? 'bg-[#36343F]' : 'bg-[#E5E7EB] text-black'
						} rounded-2xl mb-[10px] flex items-center justify-center gap-3`}
					>
						<svg
							width='20px'
							height='20px'
							viewBox='0 -28.5 256 256'
							version='1.1'
							xmlns='http://www.w3.org/2000/svg'
							xmlnsXlink='http://www.w3.org/1999/xlink'
							preserveAspectRatio='xMidYMid'
							fill={isDark ? '#fff' : '#000'}
						>
							<g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
							<g
								id='SVGRepo_tracerCarrier'
								strokeLinecap='round'
								strokeLinejoin='round'
							></g>
							<g id='SVGRepo_iconCarrier'>
								<g>
									<path
										d='M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z'
										fill={isDark ? '#fff' : '#000'}
										fillRule='nonzero'
									></path>
								</g>
							</g>
						</svg>
						Продолжить с Google
					</button>
					<button
						className={`w-full h-[50px] cursor-pointer ${
							isDark ? 'bg-[#36343F]' : 'bg-[#E5E7EB] text-black'
						} rounded-2xl flex items-center justify-center gap-3`}
					>
						<svg
							width='20px'
							height='20px'
							viewBox='0 0 48 48'
							id='b'
							xmlns='http://www.w3.org/2000/svg'
							fill={isDark ? '#fff' : '#000'}
						>
							<g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
							<g
								id='SVGRepo_tracerCarrier'
								strokeLinecap='round'
								strokeLinejoin='round'
							></g>
							<g id='SVGRepo_iconCarrier'>
								<path
									className='c'
									d='m31.6814,34.8868c-1.9155,1.29-4.3586,2.0718-7.2514,2.0718-5.59,0-10.3395-3.7723-12.04-8.8541v-.0195c-.43-1.29-.6841-2.6582-.6841-4.085s.2541-2.795.6841-4.085c1.7005-5.0818,6.45-8.8541,12.04-8.8541,3.1664,0,5.9809,1.0945,8.2286,3.2055l6.1568-6.1568c-3.7332-3.4791-8.5805-5.6095-14.3855-5.6095-8.4045,0-15.6559,4.8277-19.1936,11.8641-1.4659,2.8927-2.3064,6.1568-2.3064,9.6359s.8405,6.7432,2.3064,9.6359v.0195c3.5377,7.0168,10.7891,11.8445,19.1936,11.8445,5.805,0,10.6718-1.9155,14.2291-5.1991,4.0655-3.7527,6.4109-9.2645,6.4109-15.8123,0-1.5245-.1368-2.9905-.3909-4.3977h-20.2491v8.3264h11.5709c-.5082,2.6777-2.0327,4.945-4.3195,6.4695h0Z'
								></path>
							</g>
						</svg>
						Продолжить с Discord
					</button>
				</div>
			</div>
		</div>
	)
}

export default Divider
