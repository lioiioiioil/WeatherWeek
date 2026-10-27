import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCoordinates } from '../src/coordinates.mjs'

test('accepts numeric and string zero on either axis', () => {
  const cases = [
    [0, 0, 0, 0],
    ['0', '0', 0, 0],
    [0, 37.62, 0, 37.62],
    [55.75, 0, 55.75, 0]
  ]
  for (const [latitude, longitude, expectedLatitude, expectedLongitude] of cases) {
    assert.deepEqual(validateCoordinates(latitude, longitude), {
      latitude: expectedLatitude,
      longitude: expectedLongitude,
      error: null
    })
  }
})

test('parses decimal and exponent strings without losing precision', () => {
  assert.deepEqual(validateCoordinates(' -55.75 ', '3.762e1'), {
    latitude: -55.75,
    longitude: 37.62,
    error: null
  })
})

test('rejects empty, nonnumeric and non-finite inputs on either axis', () => {
  for (const value of ['', '   ', NaN, 'NaN', Infinity, -Infinity, 'Infinity', '10north', null, undefined]) {
    assert.equal(validateCoordinates(value, 0).error, 'invalidCoords')
    assert.equal(validateCoordinates(0, value).error, 'invalidCoords')
  }
})

test('accepts the inclusive geographic boundaries', () => {
  assert.deepEqual(validateCoordinates(-90, -180), {
    latitude: -90, longitude: -180, error: null
  })
  assert.deepEqual(validateCoordinates('90', '180'), {
    latitude: 90, longitude: 180, error: null
  })
})

test('distinguishes latitude and longitude range errors', () => {
  for (const latitude of [-90.01, 90.01]) {
    assert.equal(validateCoordinates(latitude, 0).error, 'latRange')
  }
  for (const longitude of [-180.01, 180.01]) {
    assert.equal(validateCoordinates(0, longitude).error, 'lonRange')
  }
  assert.equal(validateCoordinates(91, 181).error, 'latRange')
})
