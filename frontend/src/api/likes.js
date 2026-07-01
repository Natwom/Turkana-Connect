import api from './axios'

const likesApi = {
  getMy: () => api.get('/api/v1/likes/my'),
  getMyCount: () => api.get('/api/v1/likes/my/count'),
  like: (songId) => api.post(`/api/v1/likes/${songId}`),
  unlike: (songId) => api.delete(`/api/v1/likes/${songId}`),
}

export default likesApi