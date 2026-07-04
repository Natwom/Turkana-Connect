import api from './axios'

export const getCategories = () => api.get('/api/v1/categories')
export const getCategory = (id) => api.get(`/api/v1/categories/${id}`)

export default { getCategories, getCategory }