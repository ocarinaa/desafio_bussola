import axios from 'axios';
import type { AuthResponse, Job, Application } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },
};

export const jobsAPI = {
  getAll: async (filters?: { title?: string; company?: string; location?: string }): Promise<Job[]> => {
    const params = new URLSearchParams();
    if (filters?.title) params.append('title', filters.title);
    if (filters?.company) params.append('company', filters.company);
    if (filters?.location) params.append('location', filters.location);
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  getMyJobs: async (): Promise<Job[]> => {
    const response = await api.get('/jobs/my');
    return response.data;
  },

  getById: async (id: number): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  create: async (job: { title: string; description: string; company: string; location?: string; salary?: number }): Promise<Job> => {
    const response = await api.post('/jobs', job);
    return response.data;
  },

  update: async (id: number, job: { title: string; description: string; company: string; location?: string; salary?: number }): Promise<Job> => {
    const response = await api.put(`/jobs/${id}`, job);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  getApplications: async (id: number): Promise<Application[]> => {
    const response = await api.get(`/jobs/${id}/applications`);
    return response.data;
  },
};

export const applicationsAPI = {
  create: async (jobId: number, message: string): Promise<Application> => {
    const response = await api.post(`/jobs/${jobId}/apply`, { message });
    return response.data;
  },

  getMyApplications: async (): Promise<Application[]> => {
    const response = await api.get('/applications');
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<Application> => {
    const response = await api.put(`/applications/${id}`, { status });
    return response.data;
  },
};

export default api;
