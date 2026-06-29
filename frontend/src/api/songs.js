import api from './axios'

export const getSongs = (params = {}) => api.get('/api/v1/songs', { params })
export const getSong = (id) => api.get(`/api/v1/songs/${id}`)
export const createSong = (data) => api.post('/api/v1/songs', data)
export const recordPlay = (id) => api.post(`/api/v1/songs/${id}/play`)
export const getStreamUrl = (id) => api.get(`/api/v1/songs/${id}/stream`)

export default { getSongs, getSong, createSong, recordPlay, getStreamUrl }