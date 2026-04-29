// src/services/container/containerService.js
import apiContainer from "../../api/apiContainer.js"

export default {

  /**
   * Récupérer tous les conteneurs
   */
  async getAll(params = {}) {
    try {
      const { data } = await apiContainer.get("/containers", { params })
      return data
    } catch (error) {
      console.error("containerService.getAll error:", error)
      throw error
    }
  },

  /**
   * Récupérer un conteneur par ID
   */
  async getById(id) {
    try {
      const { data } = await apiContainer.get(`/containers/${id}`)
      return data
    } catch (error) {
      console.error("containerService.getById error:", error)
      throw error
    }
  },

  /**
   * Créer un conteneur
   */
  async create(payload) {
    try {
      const { data } = await apiContainer.post("/containers", payload)
      return data
    } catch (error) {
      console.error("containerService.create error:", error)
      throw error
    }
  },

  /**
   * Mettre à jour un conteneur
   */
  async update(id, payload) {
    try {
      const { data } = await apiContainer.put(`/containers/${id}`, payload)
      return data
    } catch (error) {
      console.error("containerService.update error:", error)
      throw error
    }
  },

  /**
   * Supprimer un conteneur
   */
  async remove(id) {
    try {
      const { data } = await apiContainer.delete(`/containers/${id}`)
      return data
    } catch (error) {
      console.error("containerService.remove error:", error)
      throw error
    }
  }

}
