import api from './axios'

export const getComments = (songId) => api.get(`/api/v1/comments/song/${songId}`)
export const postComment = (songId, content) => api.post(`/api/v1/comments/song/${songId}`, { content })
export const deleteComment = (commentId) => api.delete(`/api/v1/comments/${commentId}`)

export default { getComments, postComment, deleteComment }