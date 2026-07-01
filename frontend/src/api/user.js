import api from './axios'

const userApi = {
  getMe: () => api.get('/api/v1/users/me'),
  updateMe: (data) => api.patch('/api/v1/users/me', data),
  getStats: () => api.get('/api/v1/users/me/stats'),
  getActivity: (limit = 10) => api.get(`/api/v1/users/me/activity?limit=${limit}`),
  getHistory: (limit = 20) => api.get(`/api/v1/users/me/history?limit=${limit}`),
  getTopArtists: (limit = 5) => api.get(`/api/v1/users/me/top-artists?limit=${limit}`),
  getTrends: (days = 30) => api.get(`/api/v1/users/me/trends?days=${days}`),
  getSettings: () => api.get('/api/v1/users/me/settings'),
  updateSettings: (data) => api.patch('/api/v1/users/me/settings', data),
}

export default userApi