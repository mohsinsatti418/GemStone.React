import apiClient from './interceptors'


export const gemstoneApi = {
  getAll: () => apiClient.get('/GemStone/getall'),
  getById: (id) => apiClient.get(`/GemStone/getbyid/${id}`),

  create: (formData) =>
    apiClient.post('/GemStone/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (formData) =>
    apiClient.put('/GemStone/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id) => apiClient.delete(`/GemStone/delete/${id}`),
  restore: (id) => apiClient.patch(`/GemStone/restore/${id}`),
}