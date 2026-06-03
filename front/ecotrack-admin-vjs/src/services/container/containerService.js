// src/services/authentication/containerService.js
import apiClient from '@/api/apiClient.js'

export default {

  // Récupérer tous les containers
  async getAll() {
    const response = await apiClient.get('/containers')
    return response
  },

  // Créer un container
  async create(data) {
    console.log("Données envoyées au service : ", data)
    const response = await apiClient.post('/containers', data)
    console.log("Réponse du service : ", response)
    return response
  },

  // Détails d’un container
  async getById(id) {
    return await apiClient.get(`/containers/${id}`)
  },

  // Statistiques
  async getStats() {
    return await apiClient.get('/containers/stats')
  },

  // Recherche
  async search(params) {
    return await apiClient.get('/containers/search', { params })
  },

  // Containers à proximité
  async getNearby(params) {
    return await apiClient.get('/containers/nearby', { params })
  },

  // Mettre à jour un container
  async update(id, data) {
    return await apiClient.put(`/containers/${id}`, data)
  },

  // Supprimer un container
  async delete(id) {
    return await apiClient.delete(`/containers/${id}`)
  },

  // Historique de remplissage
  async getFillHistory(id) {
    return await apiClient.get(`/containers/${id}/fill-history`)
  },

  // Ajouter un relevé de remplissage
  async addFillHistory(id, data) {
    return await apiClient.post(`/containers/${id}/fill-history`, data)
  },

  // Upload photo
  async uploadPhoto(id, file) {
    const formData = new FormData()
    formData.append('photo', file)

    return await apiClient.post(`/containers/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

}
