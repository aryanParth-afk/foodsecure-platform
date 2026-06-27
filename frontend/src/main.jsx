import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Automatically attach JWT token to all requests targeting our own API
// This does NOT affect third-party requests (Cloudinary, Nominatim, etc.)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && config.url?.startsWith(apiUrl)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
