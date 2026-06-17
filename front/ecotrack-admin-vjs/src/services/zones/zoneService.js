import apiClient from '@/api/apiClient.js'

export default {
  getAll() {
    return apiClient.get('/zones')
  },

  getById(id) {
    return apiClient.get(`/zones/${id}`)
  },

  create(payload) {
    return apiClient.post('/zones', payload)
  },

  update(id, payload) {
    return apiClient.put(`/zones/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`/zones/${id}`)
  },

  getStats(id) {
    return apiClient.get(`/zones/${id}/stats`)
  },

  getContainers(id) {
    return apiClient.get(`/zones/${id}/containers`)
  },
}
