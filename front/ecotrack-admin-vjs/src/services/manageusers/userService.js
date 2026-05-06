// src/services/authentication/userService.js
import apiClient from '@/api/apiClient.js'

export default {
  // récupérer tous les utilisateurs
  async getAll() {
    const response = await apiClient.get('/users')
    return response
  },

  // Ajouter un utilisateur
  async createUser(userDatas) {
    console.log("Les données envoyées : ", userDatas)
    const response = await apiClient.post('/users', userDatas)
    return response
  },

  // Modifier les infos d'un utilisateur.
  async updateUser(userUuid, userDatas) {
    const response = await apiClient.put(`/users/${userUuid}`, userDatas)
    return response
  },

  // Supprimer un utilisateur
  async deleteUser(userUuid) {
    const response = await apiClient.delete(`/users/${userUuid}`)
    return response
  }
}
