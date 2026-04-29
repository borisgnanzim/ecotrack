// src/services/authentication/authService.js
import apiAuthentication from '../../api/apiAuthentication.js'

export default {
  loginUser(credentials) {
    return apiAuthentication.post('/login', credentials)
  },
  registerUser(userData) {
    return apiAuthentication.post('/register', userData)
  },
}
