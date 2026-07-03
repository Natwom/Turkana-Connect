import api from './axios'

export const getArtists = (limit = 20) => api.get(`/api/v1/artists?limit=${limit}`)
export const getArtist = (id) => api.get(`/api/v1/artists/${id}`)
export const followArtist = (id) => api.post(`/api/v1/artists/${id}/follow`)
export const unfollowArtist = (id) => api.delete(`/api/v1/artists/${id}/follow`)

// NEW: Artist own profile / dashboard
export const getMyArtistProfile = () => api.get('/api/v1/artists/me')
export const updateMyArtistProfile = (formData) => api.patch('/api/v1/artists/me', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getMyArtistStats = () => api.get('/api/v1/artists/me/stats')

export default { 
  getArtists, 
  getArtist, 
  followArtist, 
  unfollowArtist,
  getMyArtistProfile,
  updateMyArtistProfile,
  getMyArtistStats
}