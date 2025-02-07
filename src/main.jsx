import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// import AppV1 from './App.v1.0.jsx'  // Remove this
// import './App.v1.0.css'  // Remove this

// Remove the version switching code
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 