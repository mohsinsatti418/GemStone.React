import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Global error interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const gemstoneApi = {
  getAll: () => api.get('/GemStone/getall'),
  getById: (id) => api.get(`/GemStone/getbyid/${id}`),

  create: (formData) =>
    api.post('/GemStone/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (formData) =>
    api.put('/GemStone/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id) => api.delete(`/GemStone/delete/${id}`),
  restore: (id) => api.patch(`/GemStone/restore/${id}`),
}