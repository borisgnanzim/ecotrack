// src/api/apiContainer.js
import axios from 'axios'

// Base URL du back depuis les variables d'environnement
const API_BACK_URL = import.meta.env.APP_BACK_API_SERVICE_CONTAINERS

// Instance Axios configurée pour l'API
const apiClient = axios.create({
  baseURL: `${API_BACK_URL}/api`, // l'URL de l'API backend
  headers: {
    'Content-Type': 'application/ld+json', // Pour l'envoi de données, on met le type qui est bien mentionné dans notre API (interface)
    Accept: 'application/ld+json',
  },
})

export default apiClient
