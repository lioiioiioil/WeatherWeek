import React, { useEffect, useRef } from 'react'

const LABELS = {
  en: {
    max: 'High',
    min: 'Low',
    current: 'Now',
    temperature: 'Temperature'
  },
  ru: {
    max: 'Макс',
    min: 'Мин',
    current: 'Сейчас',
    temperature: 'Температура'
  }
}

function celsiusToFahrenheit(celsius) {
  return celsius * 1.8 + 32
}

function interpolate(p0, p1, p2, p3, t) {
  const t2 = t * t
  const t3 = t2 * t
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  )
}

function drawTemperatureChart(canvas, temperatures, times, currentHour, unit) {
  if (!canvas || !temperatures || temperatures.length === 0) return

  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const padding = { top: 20, right: 20, bottom: 50, left: 60 }
  const graphWidth = width - padding.left - padding.right
  const graphHeight = height - padding.top - padding.bottom
  
  // Fixed scale: -35°C to 35°C (or -31°F to 95°F for Fahrenheit)
  const minDisplayCelsius = -35
  const maxDisplayCelsius = 35
  const range = maxDisplayCelsius - minDisplayCelsius

  // Clear canvas
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // Draw grid background
  ctx.strokeStyle = '#e8e8e8'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.5

  for (let i = 0; i <= 5; i++) {
    const tempCelsius = minDisplayCelsius + (range / 5) * i
    const y = padding.top + (1 - (tempCelsius - minDisplayCelsius) / range) * graphHeight
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
  }

  ctx.globalAlpha = 1

  // Draw Y-axis labels (convert to display unit if needed)
  ctx.fillStyle = '#666'
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  for (let i = 0; i <= 5; i++) {
    const tempCelsius = minDisplayCelsius + (range / 5) * i
    const tempDisplay = unit === 'fahrenheit' ? celsiusToFahrenheit(tempCelsius) : tempCelsius
    const y = padding.top + (1 - (tempCelsius - minDisplayCelsius) / range) * graphHeight
    ctx.fillText(Math.round(tempDisplay) + '°', padding.left - 10, y)
  }

  // Draw X-axis
  ctx.strokeStyle = '#999'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top + graphHeight)
  ctx.lineTo(width - padding.right, padding.top + graphHeight)
  ctx.stroke()

  // Draw time labels
  ctx.fillStyle = '#666'
  ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const timeStep = Math.max(1, Math.floor(temperatures.length / 6))
  for (let i = 0; i < temperatures.length; i += timeStep) {
    const timeStr = times[i]?.split('T')[1]?.substring(0, 5) || `${String(i).padStart(2, '0')}:00`
    const x = padding.left + (i / (temperatures.length - 1)) * graphWidth
    ctx.fillText(timeStr, x, padding.top + graphHeight + 10)
  }

  // Calculate points using Celsius values
  const points = temperatures.map((temp, i) => ({
    x: padding.left + (i / (temperatures.length - 1)) * graphWidth,
    y: padding.top + (1 - (temp - minDisplayCelsius) / range) * graphHeight,
    temp: temp,
    index: i,
    isCurrentHour: currentHour === i
  }))

  // Draw curve
  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + graphHeight)
  gradient.addColorStop(0, 'rgba(255, 100, 100, 0.3)')
  gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.3)')
  gradient.addColorStop(1, 'rgba(100, 200, 255, 0.1)')

  ctx.fillStyle = gradient
  ctx.strokeStyle = '#0066cc'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    for (let t = 0; t <= 1; t += 0.1) {
      const x = interpolate(p0.x, p1.x, p2.x, p3.x, t)
      const y = interpolate(p0.y, p1.y, p2.y, p3.y, t)
      ctx.lineTo(x, y)
    }
  }

  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
  ctx.stroke()

  // Fill area
  ctx.fillStyle = gradient
  ctx.lineTo(points[points.length - 1].x, padding.top + graphHeight)
  ctx.lineTo(points[0].x, padding.top + graphHeight)
  ctx.closePath()
  ctx.fill()

  // Draw points
  points.forEach((point, i) => {
    if (i % Math.max(1, Math.floor(points.length / 12)) === 0 || point.isCurrentHour) {
      if (point.isCurrentHour) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.2)'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 12, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#cc3333'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = '#0066cc'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  })
}

export default function AdvancedTemperatureChart({ hourly, unit, lang, title }){
  const canvasRef = useRef(null)
  const t = LABELS[lang] || LABELS.en

  if(!hourly || !hourly.time || hourly.time.length === 0){
    return null
  }

  // Get Celsius temperatures from API (always use Celsius for graph)
  const celsiusTemperatures = (hourly.temperature_2m || []).slice(0, 24)
  const times = (hourly.time || []).slice(0, 24)

  if(celsiusTemperatures.length === 0) return null

  const maxTempCelsius = Math.max(...celsiusTemperatures)
  const minTempCelsius = Math.min(...celsiusTemperatures)
  const currentHour = new Date().getHours()
  const currentTempCelsius = celsiusTemperatures[currentHour] !== undefined 
    ? celsiusTemperatures[currentHour]
    : celsiusTemperatures[0]

  // Convert display values based on unit
  const maxTempDisplay = unit === 'fahrenheit' ? celsiusToFahrenheit(maxTempCelsius) : maxTempCelsius
  const minTempDisplay = unit === 'fahrenheit' ? celsiusToFahrenheit(minTempCelsius) : minTempCelsius
  const currentTempDisplay = unit === 'fahrenheit' ? celsiusToFahrenheit(currentTempCelsius) : currentTempCelsius

  useEffect(() => {
    const canvas = canvasRef.current
    if(!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      drawTemperatureChart(canvas, celsiusTemperatures, times, currentHour, unit)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [celsiusTemperatures, times, unit, currentHour])

  return (
    <div className="advanced-chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-unit-badge">{unit === 'celsius' ? '°C' : '°F'}</div>
      </div>

      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef}
          className="temperature-canvas"
        />
      </div>

      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">{t.max}</span>
          <span className="stat-value">{Math.round(maxTempDisplay)}°</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t.current}</span>
          <span className="stat-value">{Math.round(currentTempDisplay)}°</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t.min}</span>
          <span className="stat-value">{Math.round(minTempDisplay)}°</span>
        </div>
      </div>
    </div>
  )
}
