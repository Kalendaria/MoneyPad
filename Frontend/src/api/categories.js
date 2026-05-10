import api from './axios';

export const fetchCategories = (type) => api.get(`/categories?type=${type}`).then(r => r.data);
export const createCategory  = (data) => api.post('/categories', data).then(r => r.data);
export const updateCategory  = (id, data) => api.put(`/categories/${id}`, data).then(r => r.data);
export const deleteCategory  = (id) => api.delete(`/categories/${id}`).then(r => r.data);