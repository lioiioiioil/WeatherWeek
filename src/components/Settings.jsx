import React from 'react'

export default function Settings({ settings, onChange }){
  return (
    <div className="settings">
      <h3>Settings</h3>
      <label>
        Temperature:
        <select value={settings.unit} onChange={e=>onChange({ unit: e.target.value })}>
          <option value="celsius">Celsius (C)</option>
          <option value="fahrenheit">Fahrenheit (F)</option>
        </select>
      </label>

      <label>
        Timezone:
        <select value={settings.timezone} onChange={e=>onChange({ timezone: e.target.value })}>
          <option value="auto">Auto (Browser)</option>
          <option value="UTC">UTC</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Paris">Paris (CET)</option>
          <option value="Europe/Moscow">Moscow (MSK)</option>
          <option value="Asia/Dubai">Dubai (GST)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
          <option value="America/New_York">New York (EST)</option>
          <option value="America/Los_Angeles">Los Angeles (PST)</option>
          <option value="Australia/Sydney">Sydney (AEDT)</option>
        </select>
      </label>

      <label>
        Language:
        <select value={settings.lang} onChange={e=>onChange({ lang: e.target.value })}>
          <option value="en">English</option>
          <option value="ru">Russian</option>
        </select>
      </label>
    </div>
  )
}
