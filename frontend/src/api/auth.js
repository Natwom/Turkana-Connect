import api from './axios'

export const register = (data) => api.post('/api/v1/auth/register', data)
export const login = (data) => api.post('/api/v1/auth/login', data)
export const refresh = (refreshToken) => api.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
export const getMe = () => api.get('/api/v1/auth/me')

export default { register, login, refresh, getMe }