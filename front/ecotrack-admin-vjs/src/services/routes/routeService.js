import apiClient from '@/api/apiClient.js'

export default {
  getAll()                    { return apiClient.get('/routes') },
  getById(id)                 { return apiClient.get(`/routes/${id}`) },
  getByAgent(agentId)         { return apiClient.get(`/routes/agent/${agentId}`) },
  create(payload)             { return apiClient.post('/routes', payload) },
  update(id, payload)         { return apiClient.put(`/routes/${id}`, payload) },
  delete(id)                  { return apiClient.delete(`/routes/${id}`) },
  assignAgent(id, agentId)    { return apiClient.put(`/routes/${id}/assign`, { agentId }) },
  optimize(id)                { return apiClient.post(`/routes/${id}/optimize`) },
  validate(id)                { return apiClient.post(`/routes/${id}/validate`) },
  exportPDF(id)               { return apiClient.get(`/routes/${id}/export`, { responseType: 'blob' }) },
  sendEmail(id)               { return apiClient.post(`/routes/${id}/send`) },
}
