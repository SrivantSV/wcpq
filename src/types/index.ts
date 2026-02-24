export type UserRole = 'maker' | 'approver' | 'finance' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  gstin?: string;
  pan?: string;
}

export interface RateCard {
  id: string;
  name: string;
  description?: string;
  laborType: string;
  hourlyRate: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface OverheadRate {
  id: string;
  name: string;
  description?: string;
  rateType: 'percentage' | 'fixed';
  value: number;
  applicableTo: string;
  isActive: boolean;
  createdAt: string;
}

export interface TaxConfig {
  id: string;
  name: string;
  taxType: 'GST' | 'VAT' | 'IGST' | 'CGST' | 'SGST';
  rate: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  currency: string;
  gstin?: string;
  pan?: string;
  creditLimit?: number;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  vendorType: string;
  gstin?: string;
  pan?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  role: UserRole;
  hourlyRate: number;
  joiningDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface MaterialPriceBook {
  id: string;
  materialCode: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  unitPrice: number;
  currency: string;
  supplier?: string;
  lastUpdated: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export type BadgeStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export type JobOrderStatus = BadgeStatus;

export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export type JobType =
  | 'civil'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'painting'
  | 'carpentry'
  | 'it_infrastructure'
  | 'security'
  | 'landscaping'
  | 'other';

export interface JobOrderAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface JobOrder {
  id: string;
  jobNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientPhone: string;
  jobType: JobType;
  priority: JobPriority;
  status: JobOrderStatus;
  startDate: string;
  expectedCompletion: string;
  deliveryTerms?: string;
  internalNotes?: string;
  clientInstructions?: string;
  estimatedTotal?: number;
  attachments: JobOrderAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve')[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  maker: [
    { resource: 'job_orders', actions: ['create', 'read', 'update'] },
    { resource: 'estimates', actions: ['create', 'read', 'update'] },
    { resource: 'execution', actions: ['read', 'update'] },
    { resource: 'reports', actions: ['read'] },
  ],
  approver: [
    { resource: 'job_orders', actions: ['read', 'approve'] },
    { resource: 'estimates', actions: ['read', 'approve'] },
    { resource: 'approvals', actions: ['read', 'approve'] },
    { resource: 'reports', actions: ['read'] },
  ],
  finance: [
    { resource: 'invoices', actions: ['create', 'read', 'update'] },
    { resource: 'payments', actions: ['create', 'read', 'update'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'tax', actions: ['read'] },
  ],
  admin: [
    { resource: 'all', actions: ['create', 'read', 'update', 'delete', 'approve'] },
  ],
};
