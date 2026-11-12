import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for consistent error shape
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Students ────────────────────────────────────────────────────────────────
export const getStudents = (params) => api.get('/students', { params });
export const getStudent = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const patchStudent = (id, data) => api.patch(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// ─── Companies ───────────────────────────────────────────────────────────────
export const getCompanies = (params) => api.get('/companies', { params });
export const getCompany = (id) => api.get(`/companies/${id}`);
export const createCompany = (data) => api.post('/companies', data);
export const updateCompany = (id, data) => api.put(`/companies/${id}`, data);
export const patchCompany = (id, data) => api.patch(`/companies/${id}`, data);
export const deleteCompany = (id) => api.delete(`/companies/${id}`);

// ─── Drives ───────────────────────────────────────────────────────────────────
export const getDrives = (params) => api.get('/drives', { params });
export const getDrive = (id) => api.get(`/drives/${id}`);
export const createDrive = (data) => api.post('/drives', data);
export const updateDrive = (id, data) => api.put(`/drives/${id}`, data);
export const patchDrive = (id, data) => api.patch(`/drives/${id}`, data);
export const deleteDrive = (id) => api.delete(`/drives/${id}`);
export const registerForDrive = (driveId, studentId) =>
  api.post(`/drives/${driveId}/register`, { studentId });

// ─── Interviews ───────────────────────────────────────────────────────────────
export const getInterviews = (params) => api.get('/interviews', { params });
export const getInterview = (id) => api.get(`/interviews/${id}`);
export const createInterview = (data) => api.post('/interviews', data);
export const updateInterview = (id, data) => api.put(`/interviews/${id}`, data);
export const patchInterview = (id, data) => api.patch(`/interviews/${id}`, data);
export const deleteInterview = (id) => api.delete(`/interviews/${id}`);

// ─── Outcomes ─────────────────────────────────────────────────────────────────
export const getOutcomes = (params) => api.get('/outcomes', { params });
export const getOutcome = (id) => api.get(`/outcomes/${id}`);
export const createOutcome = (data) => api.post('/outcomes', data);
export const updateOutcome = (id, data) => api.put(`/outcomes/${id}`, data);
export const patchOutcome = (id, data) => api.patch(`/outcomes/${id}`, data);
export const deleteOutcome = (id) => api.delete(`/outcomes/${id}`);

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboardSummary = () => api.get('/dashboard/summary');

export default api;
