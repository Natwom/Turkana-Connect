import api from './axios'

export const getMyLikes = () => api.get('/api/v1/likes/my')
export const getMyLikeIds = () => api.get('/api/v1/likes/my/ids')
export const checkLike = (songId) => api.get(`/api/v1/likes/check/${songId}`)
export const likeSong = (songId) => api.post(`/api/v1/likes/${songId}`)
export const unlikeSong = (songId) => api.delete(`/api/v1/likes/${songId}`)

export default { getMyLikes, getMyLikeIds, checkLike, likeSong, unlikeSong }