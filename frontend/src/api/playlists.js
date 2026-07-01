import api from './axios'

const playlistsApi = {
  list: () => api.get('/api/v1/playlists'),
  getMy: () => api.get('/api/v1/playlists/my'),
  getMyCount: () => api.get('/api/v1/playlists/my/count'),
  create: (data) => api.post('/api/v1/playlists', data),
  addSong: (playlistId, songId) => api.post(`/api/v1/playlists/${playlistId}/songs/${songId}`),
}

export default playlistsApi