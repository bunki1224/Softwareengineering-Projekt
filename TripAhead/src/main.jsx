import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Homepage from './Pages/Homepage.jsx'
//import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Homepage/>
  </StrictMode>,
)
