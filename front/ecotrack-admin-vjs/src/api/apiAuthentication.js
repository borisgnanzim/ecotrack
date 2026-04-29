// src/api/apiAuthentication.js
import axios from 'axios'

// Base URL du back depuis les variables d'environnement
const API_BACK_URL = import.meta.env.APP_BACK_API_SERVICE_AUTH

// Instance Axios configurée pour l'API
const apiClient = axios.create({
  baseURL: `${API_BACK_URL}/api`, // l'URL de l'API backend
  headers: {
    'Content-Type': 'application/ld+json', // Pour l'envoi de données, on met le type qui est bien mentionné dans notre API (interface)
    Accept: 'application/ld+json',
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
