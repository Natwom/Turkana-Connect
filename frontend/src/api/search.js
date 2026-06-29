import api from './axios'

export const search = (query) => 
  api.get('/search', { params: { q: query } })

export default { search }