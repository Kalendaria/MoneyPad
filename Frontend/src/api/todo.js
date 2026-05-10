import api from './axios';

export const fetchWeekData = (start, end) => api.get(`/tasks?start=${start}&end=${end}`).then(r => r.data);
export const fetchDayTasks     = (date) => api.get(`/tasks?date=${date}`).then(r => r.data);
export const fetchUpcoming     = (days=3) => api.get(`/tasks/upcoming?days=${days}`).then(r => r.data);
export const createTask        = (data)  => api.post('/tasks', data).then(r => r.data);
export const updateTask        = (id, data) => api.put(`/tasks/${id}`, data).then(r => r.data);
export const updateTaskStatus  = (id, status) => api.patch(`/tasks/${id}/status`, { status }).then(r => r.data);
export const deleteTask        = (id)    => api.delete(`/tasks/${id}`).then(r => r.data);