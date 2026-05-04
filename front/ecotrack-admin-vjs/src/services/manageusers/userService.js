// src/services/authentication/userService.js
import apiClient from '@/api/apiClient.js'

export default {
  // récupérer tous les utilisateurs
  async getAll() {
    const response = await apiClient.get('/users')
    return response
  },

  // Ajouter un utilisateur
  async createUser() {

  }
}
