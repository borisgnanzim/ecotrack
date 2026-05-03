// src/services/authentication/authService.js
import apiClient from '@/api/apiClient.js'

export default {
  loginUser(credentials) {
    return apiClient.post('/auth/login', credentials)
  },
  registerUser(userData) {
    return apiClient.post('/auth/register', userData)
  },
}
