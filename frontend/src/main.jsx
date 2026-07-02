import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { PlayerProvider } from './context/PlayerContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <PlayerProvider>
            <App />
          </PlayerProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
)