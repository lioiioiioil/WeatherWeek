import React from 'react'
import WeatherApp from './components/WeatherApp'

export default function App(){
  return (
    <div className="app">
      <header>
        <h1>Лабораторная Бедин</h1>
      </header>
      <main>
        <WeatherApp />
      </main>
    </div>
  )
}
