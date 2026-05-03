import api from '../api/axios.js';

export const projectAPI = {
  create: (data) => api.post('/projects', data),
  list: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (projectId, data) => api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId, memberId) => api.delete(`/projects/${projectId}/members/${memberId}`),
};

export const taskAPI = {
  create: (data) => api.post('/tasks', data),
  list: (projectId) => api.get('/tasks', { params: { projectId } }),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  stats: (projectId) => api.get(`/tasks/stats/${projectId}`),
};
