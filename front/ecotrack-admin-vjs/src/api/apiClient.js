// src/api/apiClient.js
import axios from 'axios'

// Base URL du back depuis les variables d'environnement
const API_BACK_URL = import.meta.env.VITE_APP_BACK_API_GATEWAY

console.log("BASE URL =", API_BACK_URL)

// Instance Axios configurée pour l'API
const apiClient = axios.create({
  baseURL: `${API_BACK_URL}`, // l'URL de l'API backend
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor pour ajouter automatiquement le JWT à toutes les requêtes
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage ou sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    // Si un token est présent, l'ajouter à l'en-tête Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

export default apiClient
