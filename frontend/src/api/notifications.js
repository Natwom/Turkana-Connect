import api from './axios'

export const getNotifications = () => api.get('/notifications/')
export const markAsRead = (id) => api.post(`/notifications/${id}/read`)
export const markAllAsRead = () => api.post('/notifications/read-all')

export default {
  getNotifications,
  markAsRead,
  markAllAsRead
}