import api from './axios'

export const search = (q) => api.get('/api/v1/search', { params: { q } })

export default { search }