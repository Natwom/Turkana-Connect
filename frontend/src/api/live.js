import api from './axios'

const liveApi = {
  getActiveStreams: (limit = 10) => api.get(`/api/v1/live/streams/active?limit=${limit}`),
  
  getStreams: (status = 'live', limit = 20, offset = 0) => 
    api.get(`/api/v1/live/streams?status=${status}&limit=${limit}&offset=${offset}`),
  
  getStream: (streamId) => api.get(`/api/v1/live/streams/${streamId}`),
  
  createStream: (data) => api.post('/api/v1/live/streams', data),
  
  startStream: (streamId) => api.post(`/api/v1/live/streams/${streamId}/start`),
  
  endStream: (streamId) => api.post(`/api/v1/live/streams/${streamId}/end`),
  
  joinStream: (streamId, sessionId) => 
    api.post(`/api/v1/live/streams/${streamId}/join?session_id=${sessionId}`),
  
  leaveStream: (streamId, sessionId) => 
    api.post(`/api/v1/live/streams/${streamId}/leave?session_id=${sessionId}`),
  
  getViewers: (streamId) => api.get(`/api/v1/live/streams/${streamId}/viewers`),
  
  getMyStreams: () => api.get('/api/v1/live/my-streams'),
  
  deleteStream: (streamId) => api.delete(`/api/v1/live/streams/${streamId}`)
}

export default liveApi