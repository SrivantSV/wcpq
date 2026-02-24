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

export type EstimationStatus =
  | 'draft'
  | 'under_review'
  | 'internally_approved'
  | 'returned_for_revision'
  | 'awaiting_client'
  | 'client_approved'
  | 'rejected';

export type MaterialSource = 'from_stock' | 'external_purchase';
export type LaborSource = 'own_staff' | 'subcontractor';
export type OverheadBasis = 'percent_labor' | 'percent_materials' | 'fixed_amount' | 'per_machine_hour';

export interface MaterialLineItem {
  id: string;
  description: string;
  source: MaterialSource;
  supplierTag?: string;
  unit: string;
  estimatedQty: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface LaborLineItem {
  id: string;
  taskDescription: string;
  laborSource: LaborSource;
  supplierTag?: string;
  workerRole?: string;
  estimatedHours: number;
  hourlyRate: number;
  totalCost: number;
  notes?: string;
}

export interface OverheadLineItem {
  id: string;
  description: string;
  basis: OverheadBasis;
  rateValue: number;
  calculatedTotal: number;
  notes?: string;
}

export interface ApprovalRecord {
  id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'revised';
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  notes?: string;
}

export interface RevisionHistory {
  revisionNumber: number;
  createdAt: string;
  createdBy: string;
  materials: MaterialLineItem[];
  labor: LaborLineItem[];
  overhead: OverheadLineItem[];
  profitMarginPct: number;
  grandTotal: number;
  changeNote?: string;
}

export interface ClientApprovalRecord {
  approvedOn: string;
  approvalMethod: 'email' | 'whatsapp' | 'signed_copy' | 'verbal';
  referenceNotes?: string;
  proofFileName?: string;
  recordedBy: string;
}

export interface Estimate {
  id: string;
  jobOrderId: string;
  jobNumber: string;
  status: EstimationStatus;
  revisionNumber: number;
  assignedEstimator: string;
  materials: MaterialLineItem[];
  labor: LaborLineItem[];
  overhead: OverheadLineItem[];
  profitMarginPct: number;
  materialsTotal: number;
  laborTotal: number;
  overheadTotal: number;
  subTotal: number;
  profitAmount: number;
  grandTotal: number;
  effectiveMarginPct: number;
  approvalTrail: ApprovalRecord[];
  revisionHistory: RevisionHistory[];
  clientApproval?: ClientApprovalRecord;
  returnedNotes?: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  createdAt: string;
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
