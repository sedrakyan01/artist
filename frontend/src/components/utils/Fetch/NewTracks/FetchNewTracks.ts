export const fetchNewTracks = async () => {
	const response = await fetch('http://localhost:8080/main', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(errorText)
	}

	const data = await response.json()
	return data.tracks?.newTracks || []
}
