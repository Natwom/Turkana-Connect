import api from './axios'

export const search = (query) => 
  api.get('/api/v1/search', { params: { q: query } })

export default { search }