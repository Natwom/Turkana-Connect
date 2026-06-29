import api from './axios'

export const getArtists = (limit = 20) => api.get(`/api/v1/artists?limit=${limit}`)
export const getArtist = (id) => api.get(`/api/v1/artists/${id}`)
export const followArtist = (id) => api.post(`/api/v1/artists/${id}/follow`)
export const unfollowArtist = (id) => api.delete(`/api/v1/artists/${id}/follow`)

export default { getArtists, getArtist, followArtist, unfollowArtist }