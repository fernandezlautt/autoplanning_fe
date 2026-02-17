import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Subject {
  id: number;
  name: string;
  semester: '1st' | '2nd' | 'yearly';
  startWeek: number;
  endWeek: number;
  weeks?: Week[];
  semesterStartDate?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface Week {
  id: number;
  weekNumber: number;
  content: string;
  resources?: Resource[];
}

export interface Resource {
  id: number;
  url: string;
  title?: string;
  description?: string;
}

export interface CreateSubjectRequest {
  name: string;
  semester: '1st' | '2nd' | 'yearly';
}

export interface UpdateSubjectRequest {
  name?: string;
  semester?: '1st' | '2nd' | 'yearly';
}

export interface UpdateWeekRequest {
  content: string;
}

export interface CreateResourceRequest {
  url: string;
  title?: string;
  description?: string;
}

export const subjectsApi = {
  getAll: async (): Promise<Subject[]> => {
    const response = await api.get<Subject[]>('/subjects');
    return response.data;
  },
  getById: async (id: number): Promise<Subject> => {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },
  create: async (data: CreateSubjectRequest): Promise<Subject> => {
    const response = await api.post<Subject>('/subjects', data);
    return response.data;
  },
  update: async (id: number, data: UpdateSubjectRequest): Promise<Subject> => {
    const response = await api.put<Subject>(`/subjects/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  },
};

export const weeksApi = {
  getById: async (id: number): Promise<Week> => {
    const response = await api.get<Week>(`/weeks/${id}`);
    return response.data;
  },
  update: async (id: number, data: UpdateWeekRequest): Promise<Week> => {
    const response = await api.put<Week>(`/weeks/${id}`, data);
    return response.data;
  },
  createResource: async (weekId: number, data: CreateResourceRequest): Promise<Resource> => {
    const response = await api.post<Resource>(`/weeks/${weekId}/resources`, data);
    return response.data;
  },
  updateResource: async (id: number, data: Partial<CreateResourceRequest>): Promise<Resource> => {
    const response = await api.put<Resource>(`/weeks/resources/${id}`, data);
    return response.data;
  },
  deleteResource: async (id: number): Promise<void> => {
    await api.delete(`/weeks/resources/${id}`);
  },
};

export const exportApi = {
  exportSubject: async (subjectId: number): Promise<Blob> => {
    const response = await api.get(`/export/subjects/${subjectId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
