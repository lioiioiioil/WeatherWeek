import React, { useState, useEffect } from 'react'
import Settings from './Settings'
import ForecastCard from './ForecastCard'
import AdvancedTemperatureChart from './AdvancedTemperatureChart'
import { validateCoordinates } from '../coordinates.mjs'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

const LABELS = {
  en: {
    byCoords: 'By Coordinates',
    latitude: 'Latitude',
    longitude: 'Longitude',
    getWeather: 'Get Weather',
    byCity: 'By City Name',
    city: 'City',
    search: 'Search',
    myLocation: 'My Location',
    loading: 'Loading...',
    error: 'Error',
    forecast7days: '7-Day Forecast',
    chart: 'Temperature Today',
    invalidCoords: 'Please enter valid coordinates',
    latRange: 'Latitude must be between -90 and 90',
    lonRange: 'Longitude must be between -180 and 180',
    enterCity: 'Please enter a city name',
    cityNotFound: 'not found',
    geoNotSupported: 'Geolocation not supported',
    geoDenied: 'Location access denied',
    geoUnavailable: 'Location service unavailable',
    geoTimeout: 'Location request timeout',
    placeholderLat: 'e.g. 55.75',
    placeholderLon: 'e.g. 37.62',
    placeholderCity: 'Moscow, Tokyo, etc.',
    viewingCoords: 'Viewing weather for',
    viewingCity: 'Viewing weather for'
  },
  ru: {
    byCoords: 'По координатам',
    latitude: 'Широта',
    longitude: 'Долгота',
    getWeather: 'Получить',
    byCity: 'По названию города',
    city: 'Город',
    search: 'Поиск',
    myLocation: 'Моё место',
    loading: 'Загрузка...',
    error: 'Ошибка',
    forecast7days: 'Прогноз на неделю',
    chart: 'Температура сегодня',
    invalidCoords: 'Введите корректные координаты',
    latRange: 'Широта: от -90 до 90',
    lonRange: 'Долгота: от -180 до 180',
    enterCity: 'Введите название города',
    cityNotFound: 'не найден',
    geoNotSupported: 'Геолокация не поддерживается',
    geoDenied: 'Доступ запрещен',
    geoUnavailable: 'Сервис недоступен',
    geoTimeout: 'Превышено время ожидания',
    placeholderLat: 'например 55.75',
    placeholderLon: 'например 37.62',
    placeholderCity: 'Москва, Токио и т.д.',
    viewingCoords: 'Погода для',
    viewingCity: 'Погода для'
  }
}

export default function WeatherApp(){
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [place, setPlace] = useState('')
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState({ unit: 'celsius', timezone: 'auto', lang: 'en' })
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)

  const t = LABELS[settings.lang] || LABELS.en
  const coordinateError = validateCoordinates(lat, lon).error

  // Автоматическое обновление при смене settings
  useEffect(() => {
    if(forecast && currentLocation){
      refetchWeatherWithCurrentSettings()
    }
  }, [settings.unit, settings.timezone])

  async function refetchWeatherWithCurrentSettings(){
    if(!forecast || !currentLocation) return
    
    try{
      const params = new URLSearchParams({
        latitude: currentLocation.lat.toString(),
        longitude: currentLocation.lon.toString(),
        daily: 'temperature_2m_max,temperature_2m_min,weathercode',
        hourly: 'temperature_2m',
        forecast_days: '7',
        timezone: settings.timezone,
        temperature_unit: 'celsius'
      })
      
      const url = `${FORECAST_URL}?${params.toString()}`
      const res = await fetch(url)
      if(!res.ok) return
      
      const data = await res.json()
      setForecast({ data, latitude: currentLocation.lat, longitude: currentLocation.lon })
    }catch(e){
      console.error('Refetch error:', e)
    }
  }

  async function fetchCitySuggestions(query){
    if(!query || query.length < 2){
      setSuggestions([])
      return
    }

    try{
      const params = new URLSearchParams({ 
        name: query.trim(), 
        count: '10', 
        language: settings.lang 
      })
      const res = await fetch(`${GEOCODING_URL}?${params.toString()}`)
      const body = await res.json()
      
      if(body.results && body.results.length > 0){
        setSuggestions(body.results.map(r => ({
          name: r.name,
          country: r.country,
          latitude: r.latitude,
          longitude: r.longitude,
          full: `${r.name}, ${r.country}`
        })))
        setShowSuggestions(true)
      }else{
        setSuggestions([])
      }
    }catch(e){
      console.error('Suggestion error:', e)
      setSuggestions([])
    }
  }

  async function fetchWeather(latitude, longitude, source = 'coords', cityName = null){
    setError('')
    setLoading(true)
    setForecast(null)
    setCurrentLocation(null)
    try{
      const coordinates = validateCoordinates(latitude, longitude)
      if(coordinates.error) throw new Error(t[coordinates.error])
      latitude = coordinates.latitude
      longitude = coordinates.longitude

      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        daily: 'temperature_2m_max,temperature_2m_min,weathercode',
        hourly: 'temperature_2m',
        forecast_days: '7',
        timezone: settings.timezone,
        temperature_unit: 'celsius'
      })
      
      const url = `${FORECAST_URL}?${params.toString()}`
      const res = await fetch(url)
      if(!res.ok){
        throw new Error(t.apiError)
      }
      
      const data = await res.json()
      
      if(source === 'city'){
        setCurrentLocation({ type: 'city', name: cityName || place, lat: latitude, lon: longitude })
      }else{
        setCurrentLocation({ type: 'coords', lat: latitude, lon: longitude })
      }
      
      setForecast({ data, latitude, longitude })
    }catch(e){
      setError(e.message)
    }finally{
      setLoading(false)
    }
  }

  async function fetchByPlace(name, suggestion = null){
    setError('')
    setLoading(true)
    setForecast(null)
    setCurrentLocation(null)
    setSuggestions([])
    setShowSuggestions(false)
    try{
      if(!name || !name.trim()){
        throw new Error(t.enterCity)
      }
      
      let latitude, longitude
      
      if(suggestion){
        latitude = suggestion.latitude
        longitude = suggestion.longitude
        setPlace(suggestion.full)
        setLat(latitude)
        setLon(longitude)
        setLoading(false)
        await fetchWeather(latitude, longitude, 'city', suggestion.full)
      }else{
        const params = new URLSearchParams({ 
          name: name.trim(), 
          count: '1', 
          language: settings.lang 
        })
        
        const res = await fetch(`${GEOCODING_URL}?${params.toString()}`)
        if(!res.ok){
          throw new Error(t.geocodingError)
        }
        
        const body = await res.json()
        if(!body.results || body.results.length === 0){
          throw new Error(`"${name}" ${t.cityNotFound}`)
        }
        
        const { latitude: lat, longitude: lon, name: foundName, country } = body.results[0]
        const fullName = `${foundName}, ${country}`
        setLat(lat)
        setLon(lon)
        setPlace(fullName)
        setLoading(false)
        
        await fetchWeather(lat, lon, 'city', fullName)
      }
    }catch(e){
      setError(e.message)
      setLoading(false)
    }
  }

  function useMyLocation(){
    setError('')
    if(!navigator.geolocation){
      setError(t.geoNotSupported)
      return
    }
    
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try{
          const { latitude, longitude } = pos.coords
          setLat(latitude)
          setLon(longitude)
          setPlace('')
          await fetchWeather(latitude, longitude, 'coords')
        }catch(e){
          setError(e.message)
          setLoading(false)
        }
      }, 
      (err) => {
        let errorMsg = t.geoNotSupported
        if(err.code === 1){
          errorMsg = t.geoDenied
        }else if(err.code === 2){
          errorMsg = t.geoUnavailable
        }else if(err.code === 3){
          errorMsg = t.geoTimeout
        }
        setError(errorMsg)
        setLoading(false)
      },
      { timeout: 10000 }
    )
  }

  function handleSettingsChange(next){
    setSettings(prev => ({ ...prev, ...next }))
  }

  function handleKeyPress(e, callback){
    if(e.key === 'Enter') {
      callback()
    }
  }

  return (
    <div className="weather-app">
      <div className="controls">
        <div className="coords">
          <h4>{t.byCoords}</h4>
          <label>
            {t.latitude}: 
            <input 
              value={lat} 
              onChange={e=>setLat(e.target.value)} 
              onKeyPress={e=>handleKeyPress(e, ()=>fetchWeather(lat, lon, 'coords'))} 
              placeholder={t.placeholderLat}
              type="number" 
              min="-90" 
              max="90" 
              step="0.01"
            />
          </label>
          <label>
            {t.longitude}: 
            <input 
              value={lon} 
              onChange={e=>setLon(e.target.value)} 
              onKeyPress={e=>handleKeyPress(e, ()=>fetchWeather(lat, lon, 'coords'))} 
              placeholder={t.placeholderLon}
              type="number" 
              min="-180" 
              max="180" 
              step="0.01"
            />
          </label>
          <button 
            onClick={()=>fetchWeather(lat, lon, 'coords')} 
            disabled={loading || coordinateError !== null}
          >
            {t.getWeather}
          </button>
        </div>

        <div className="place">
          <h4>{t.byCity}</h4>
          <div className="autocomplete-wrapper">
            <label>
              {t.city}: 
              <input 
                value={place} 
                onChange={e=>{
                  setPlace(e.target.value)
                  fetchCitySuggestions(e.target.value)
                }}
                onKeyPress={e=>handleKeyPress(e, ()=>fetchByPlace(place))}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => place && fetchCitySuggestions(place)}
                placeholder={t.placeholderCity}
              />
            </label>
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-list">
                {suggestions.map((sugg, i) => (
                  <div 
                    key={i}
                    className="suggestion-item"
                    onClick={() => fetchByPlace(sugg.full, sugg)}
                  >
                    {sugg.full}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={()=>fetchByPlace(place)} 
            disabled={loading || !place}
          >
            {t.search}
          </button>
          <button 
            onClick={useMyLocation} 
            disabled={loading}
          >
            {t.myLocation}
          </button>
        </div>

        <Settings settings={settings} onChange={handleSettingsChange} />
      </div>

      <div className="result">
        {loading && <div className="loading">{t.loading}</div>}
        {error && <div className="error">{t.error}: {error}</div>}
        {forecast && currentLocation && (
          <div>
            <div className="location-info">
              {currentLocation.type === 'city' 
                ? `${t.viewingCity}: ${currentLocation.name}` 
                : `${t.viewingCoords}: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lon.toFixed(4)}`
              }
            </div>
            {forecast.data.hourly && (
              <AdvancedTemperatureChart 
                hourly={forecast.data.hourly} 
                unit={settings.unit}
                lang={settings.lang}
                title={t.chart}
              />
            )}
            <h2>{t.forecast7days}</h2>
            <div className="forecast-grid">
              {forecast.data.daily.time.map((d, i)=> (
                <ForecastCard 
                  key={d} 
                  date={d} 
                  max={forecast.data.daily.temperature_2m_max[i]} 
                  min={forecast.data.daily.temperature_2m_min[i]} 
                  code={forecast.data.daily.weathercode[i]} 
                  lang={settings.lang} 
                  unit={settings.unit} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
