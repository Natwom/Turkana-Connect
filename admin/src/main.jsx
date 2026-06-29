import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    </HashRouter>
  </React.StrictMode>
)