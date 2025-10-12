export const ArtistsSkeleton = () => {
	return (
		<div className='relative w-[233px] rounded-2xl overflow-hidden'>
			<div className='relative bg-[#2a2831] rounded-2xl p-6 border-2 border-[#2a2831]'>
				<div className='relative mx-auto w-32 h-32 mb-5'>
					<div className='relative w-full h-full rounded-full border-4 border-purple-500/20 overflow-hidden shadow-2xl'>
						<div className='w-full h-full bg-gradient-to-r from-[#34333b] via-[#3d3c44] to-[#34333b] animate-pulse' />
					</div>
				</div>

				<div className='flex justify-center mb-5'>
					<div className='h-4 bg-gradient-to-r from-[#34333b] via-[#3d3c44] to-[#34333b] rounded animate-pulse w-32' />
				</div>

				<div className='space-y-2'>
					<div className='flex items-center justify-center gap-2 bg-[#34333b] rounded-lg p-2.5'>
						<div className='h-4 bg-gradient-to-r from-[#3d3c44] via-[#46454d] to-[#3d3c44] rounded animate-pulse w-28' />
					</div>

					<div className='flex items-center justify-center gap-2 bg-[#34333b] rounded-lg p-2.5'>
						<div className='h-4 bg-gradient-to-r from-[#3d3c44] via-[#46454d] to-[#3d3c44] rounded animate-pulse w-24' />
					</div>
				</div>
			</div>
		</div>
	)
}