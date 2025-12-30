import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

// Configure Axios Global Defaults
// If VITE_API_URL is set (e.g. in Vercel), use it. Otherwise use relative path (local proxy)
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl && apiUrl !== '/') {
  axios.defaults.baseURL = apiUrl;
} else {
    // Default to empty (relative path) for proxy
    axios.defaults.baseURL = ''; 
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
