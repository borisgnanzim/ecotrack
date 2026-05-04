// src/services/authentication/authStorage.js
import apiClient from '@/api/apiClient.js'

export default {
  // Le token de l'utilisateur connecté
  getToken() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    // const expiration =
    //   localStorage.getItem('token_expiration') || sessionStorage.getItem('token_expiration')
    // if (!token || !expiration) return null
    // if (Date.now() > parseInt(expiration)) {
    //   this.logoutUser()
    //   return null
    // }
    return token
  },

  getUserUuid() {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
    if (!userId) return
    return userId
  },

  // l'utilisateur connecté
  async getProfile() {
    const response = await apiClient.get('users/profile')
    const connectedUser = response.data
    return connectedUser
  },

  // Les roles de l'utilisateur depuis la bdd
  async getRoles() {
    const response = await this.getProfile()
    const roles = response.data.roles
    return roles
  }
}

// La méhtode de déconnexion
export function logout() {
  // localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('roles')
  localStorage.removeItem('rememberMeData')

  // sessionStorage
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('userId')
  sessionStorage.removeItem('roles')
}
