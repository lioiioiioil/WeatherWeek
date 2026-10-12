import React from 'react'

const WEATHERCODE = {
  en: {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers', 85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail'
  },
  ru: {
    0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Пасмурно', 45: 'Туман', 48: 'Наледь', 51: 'Лёгкая морось', 53: 'Умеренная морось', 55: 'Плотная морось', 61: 'Небольшой дождь', 63: 'Умеренный дождь', 65: 'Сильный дождь', 71: 'Небольшой снег', 73: 'Умеренный снег', 75: 'Сильный снег', 77: 'Снежные зёрна', 80: 'Небольшие ливни', 81: 'Умеренные ливни', 82: 'Сильные ливни', 85: 'Лёгкие ливни со снегом', 86: 'Сильные ливни со снегом', 95: 'Гроза', 96: 'Гроза с градом', 99: 'Гроза с градом'
  }
}

const WEATHER_EMOJI = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌧️', 53: '🌧️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '⛈️', 71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️', 80: '🌧️', 81: '⛈️', 82: '⛈️', 85: '🌨️', 86: '🌨️', 95: '⛈️', 96: '⛈️', 99: '⛈️'
}

export default function ForecastCard({ date, max, min, code, lang, unit }){
  const desc = (WEATHERCODE[lang] && WEATHERCODE[lang][code]) || '—'
  const emoji = WEATHER_EMOJI[code] || '🌡️'
  
  // Convert from Celsius to Fahrenheit if needed
  const celsiusToFahrenheit = (celsius) => celsius * 1.8 + 32
  
  const displayMax = unit === 'fahrenheit' ? celsiusToFahrenheit(max) : max
  const displayMin = unit === 'fahrenheit' ? celsiusToFahrenheit(min) : min
  
  const dateObj = new Date(date)
  const dayName = dateObj.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' })
  const dayNum = dateObj.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' })
  
  return (
    <div className="card">
      <div className="date">{dayName} {dayNum}</div>
      <div className="emoji">{emoji}</div>
      <div className="desc">{desc}</div>
      <div className="temps">{Math.round(displayMax)}° / {Math.round(displayMin)}° {unit === 'celsius' ? 'C' : 'F'}</div>
    </div>
  )
}
