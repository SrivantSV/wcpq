import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { ApiResponse, PaginationParams } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function buildQueryString(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
  });
  return q.toString();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  /** POST /auth/login — Authenticate user with email & password */
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: unknown; token: string }>>('/auth/login', { email, password }),

  /** POST /auth/logout — Invalidate current session token */
  logout: () => apiClient.post('/auth/logout'),

  /** GET /auth/me — Get current authenticated user profile */
  me: () => apiClient.get<ApiResponse<unknown>>('/auth/me'),

  /** POST /auth/refresh — Refresh access token */
  refresh: () => apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh'),

  /** POST /auth/change-password — Change authenticated user's password */
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/auth/change-password', { currentPassword, newPassword }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  /** GET /users — List all users with optional pagination & search */
  list: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<unknown[]>>(`/users?${buildQueryString(params || {})}`),

  /** GET /users/:id — Get a single user by ID */
  get: (id: string) => apiClient.get<ApiResponse<unknown>>(`/users/${id}`),

  /** POST /users — Create a new user */
  create: (data: unknown) => apiClient.post<ApiResponse<unknown>>('/users', data),

  /** PUT /users/:id — Update user by ID */
  update: (id: string, data: unknown) => apiClient.put<ApiResponse<unknown>>(`/users/${id}`, data),

  /** DELETE /users/:id — Soft-delete user by ID */
  delete: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/users/${id}`),

  /** PATCH /users/:id/toggle-status — Toggle user active status */
  toggleStatus: (id: string) => apiClient.patch<ApiResponse<unknown>>(`/users/${id}/toggle-status`),
};

// ─── Company ──────────────────────────────────────────────────────────────────
export const companyApi = {
  /** GET /company — Get company profile */
  get: () => apiClient.get<ApiResponse<unknown>>('/company'),

  /** PUT /company — Update company profile */
  update: (data: unknown) => apiClient.put<ApiResponse<unknown>>('/company', data),

  /** POST /company/logo — Upload company logo (multipart/form-data) */
  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return apiClient.post<ApiResponse<{ url: string }>>('/company/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Rate Cards ───────────────────────────────────────────────────────────────
export const rateCardsApi = {
  /** GET /rate-cards — List all rate cards */
  list: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<unknown[]>>(`/rate-cards?${buildQueryString(params || {})}`),

  /** GET /rate-cards/:id — Get a single rate card */
  get: (id: string) => apiClient.get<ApiResponse<unknown>>(`/rate-cards/${id}`),

  /** POST /rate-cards — Create a new rate card */
  create: (data: unknown) => apiClient.post<ApiResponse<unknown>>('/rate-cards', data),

  /** PUT /rate-cards/:id — Update rate card */
  update: (id: string, data: unknown) => apiClient.put<ApiResponse<unknown>>(`/rate-cards/${id}`, data),

  /** DELETE /rate-cards/:id — Delete rate card */
  delete: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/rate-cards/${id}`),
};

// ─── Overhead Rates ───────────────────────────────────────────────────────────
export const overheadRatesApi = {
  /** GET /overhead-rates — List all overhead rates */
  list: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<unknown[]>>(`/overhead-rates?${buildQueryString(params || {})}`),

  /** GET /overhead-rates/:id — Get a single overhead rate */
  get: (id: string) => apiClient.get<ApiResponse<unknown>>(`/overhead-rates/${id}`),

  /** POST /overhead-rates — Create overhead rate */
  create: (data: unknown) => apiClient.post<ApiResponse<unknown>>('/overhead-rates', data),

  /** PUT /overhead-rates/:id — Update overhead rate */
  update: (id: string, data: unknown) => apiClient.put<ApiResponse<unknown>>(`/overhead-rates/${id}`, data),

  /** DELETE /overhead-rates/:id — Delete overhead rate */
  delete: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/overhead-rates/${id}`),
};

// ─── Tax Config ───────────────────────────────────────────────────────────────
export const taxApi = {
  /** GET /tax-configs — List all tax configurations */
  list: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<unknown[]>>(`/tax-configs?${buildQueryString(params || {})}`),

  /** GET /tax-configs/:id — Get a single tax configuration */
  get: (id: string) => apiClient.get<ApiResponse<unknown>>(`/tax-configs/${id}`),

  /** POST /tax-configs — Create tax configuration */
  create: (data: unknown) => apiClient.post<ApiResponse<unknown>>('/tax-configs', data),

  /** PUT /tax-configs/:id — Update tax configuration */
  update: (id: string, data: unknown) => apiClient.put<ApiResponse<unknown>>(`/tax-configs/${id}`, data),

  /** DELETE /tax-configs/:id — Delete tax configuration */
  delete: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/tax-configs/${id}`),
};

// ─── Clients ──────────────────────────────────────────────────────────────────
export const clientsApi = {
  /** GET /clients — List all clients */
  list: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<unknown[]>>(`/clients?${buildQueryString(params || {})}`),

  /** GET /clients/:id — Get a single client */
  get: (id: string) => apiClient.get<ApiResponse<unknown>>(`/clients/${id}`),

  /** POST /clients — Create a new client */
  create: (data: unknown) => apiClient.post<ApiResponse<unknown>>('/clients', data),

  /** PUT /clients/:id — Update client */
  update: (id: string, data: unknown) => apiClient.put<ApiResponse<unknown>>(`/clients/${id}`, data),

  /** DELETE /clients/:id — Soft-delete client */
  delete: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/clients/${id}`),

  /** PATCH /clients/:id/toggle-status — Toggle client active status */
  toggleStatus: (id: string) => apiClient.patch<ApiResponse<unknown>>(`/clients/${id}/toggle-status`),
};

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const vendorsApi = {
  /** GET /vendors — List all vendors */
  list: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<unknown[]>>(`/vendors?${buildQueryString(params || {})}`),

  /** GET /vendors/:id — Get a single vendor */
  get: (id: string) => apiClient.get<ApiResponse<unknown>>(`/vendors/${id}`),

  /** POST /vendors — Create a new vendor */
  create: (data: unknown) => apiClient.post<ApiResponse<unknown>>('/vendors', data),

  /** PUT /vendors/:id — Update vendor */
  update: (id: string, data: unknown) => apiClient.put<ApiResponse<unknown>>(`/vendors/${id}`, data),

  /** DELETE /vendors/:id — Soft-delete vendor */
  delete: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/vendors/${id}`),

  /** PATCH /vendors/:id/toggle-status — Toggle vendor active status */
  toggleStatus: (id: string) => apiClient.patch<ApiResponse<unknown>>(`/vendors/${id}/toggle-status`),
};

// ─── Staff ────────────────────────────────────────────────────────────────────
export const staffApi = {
  /** GET /staff — List all staff members */
  list: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<unknown[]>>(`/staff?${buildQueryString(params || {})}`),

  /** GET /staff/:id — Get a single staff member */
  get: (id: string) => apiClient.get<ApiResponse<unknown>>(`/staff/${id}`),

  /** POST /staff — Create a new staff member */
  create: (data: unknown) => apiClient.post<ApiResponse<unknown>>('/staff', data),

  /** PUT /staff/:id — Update staff member */
  update: (id: string, data: unknown) => apiClient.put<ApiResponse<unknown>>(`/staff/${id}`, data),

  /** DELETE /staff/:id — Soft-delete staff member */
  delete: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/staff/${id}`),

  /** PATCH /staff/:id/toggle-status — Toggle staff active status */
  toggleStatus: (id: string) => apiClient.patch<ApiResponse<unknown>>(`/staff/${id}/toggle-status`),
};

// ─── Material Price Book ──────────────────────────────────────────────────────
export const materialsApi = {
  /** GET /materials — List all materials in price book */
  list: (params?: PaginationParams & { category?: string }) =>
    apiClient.get<ApiResponse<unknown[]>>(`/materials?${buildQueryString(params || {})}`),

  /** GET /materials/:id — Get a single material */
  get: (id: string) => apiClient.get<ApiResponse<unknown>>(`/materials/${id}`),

  /** POST /materials — Add material to price book */
  create: (data: unknown) => apiClient.post<ApiResponse<unknown>>('/materials', data),

  /** PUT /materials/:id — Update material price / details */
  update: (id: string, data: unknown) => apiClient.put<ApiResponse<unknown>>(`/materials/${id}`, data),

  /** DELETE /materials/:id — Remove material from price book */
  delete: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/materials/${id}`),

  /** GET /materials/categories — Get all material categories */
  categories: () => apiClient.get<ApiResponse<string[]>>('/materials/categories'),

  /** POST /materials/import — Bulk import materials via CSV */
  import: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post<ApiResponse<{ imported: number; failed: number }>>('/materials/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default apiClient;
