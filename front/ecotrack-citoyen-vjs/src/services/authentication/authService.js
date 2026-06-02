// src/services/authentication/authService.js
import apiClient from '@/api/apiClient.js'

export default {
  loginUser(credentials) {
    console.log("Tentative de login avec :", credentials)
    return apiClient.post('/auth/login', credentials)
  },
  registerUser(userData) {
    return apiClient.post('/auth/register/citizen', userData)
  },
}
