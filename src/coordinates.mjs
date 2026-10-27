function parseCoordinate(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return NaN
  if (typeof value === 'string' && value.trim() === '') return NaN
  return Number(value)
}

export function validateCoordinates(latitudeInput, longitudeInput) {
  const latitude = parseCoordinate(latitudeInput)
  const longitude = parseCoordinate(longitudeInput)
  let error = null

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    error = 'invalidCoords'
  } else if (latitude < -90 || latitude > 90) {
    error = 'latRange'
  } else if (longitude < -180 || longitude > 180) {
    error = 'lonRange'
  }

  return { latitude, longitude, error }
}
