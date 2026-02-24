import { create } from 'zustand';
import type { JobOrder, JobOrderStatus, JobPriority, JobType } from '@/types';

const CLIENTS = [
  { id: 'c1', name: 'Infosys Ltd', contact: 'Ankit Sharma', email: 'ankit@infosys.com', phone: '+91 98765 43210' },
  { id: 'c2', name: 'TCS Bangalore', contact: 'Priya Nair', email: 'priya@tcs.com', phone: '+91 87654 32109' },
  { id: 'c3', name: 'Wipro Campus', contact: 'Rajan Mehta', email: 'rajan@wipro.com', phone: '+91 76543 21098' },
  { id: 'c4', name: 'HCL Tech Park', contact: 'Sunita Rao', email: 'sunita@hcl.com', phone: '+91 65432 10987' },
  { id: 'c5', name: 'Cognizant SEZ', contact: 'Deepak Verma', email: 'deepak@cognizant.com', phone: '+91 54321 09876' },
  { id: 'c6', name: 'Accenture India', contact: 'Kavya Reddy', email: 'kavya@accenture.com', phone: '+91 43210 98765' },
];

const SEED_JOBS: JobOrder[] = [
  {
    id: 'j1', jobNumber: 'JO-2025-0081', title: 'Civil Works Block B — Foundation & Structural',
    clientId: 'c1', clientName: 'Infosys Ltd', clientContact: 'Ankit Sharma', clientEmail: 'ankit@infosys.com', clientPhone: '+91 98765 43210',
    jobType: 'civil', priority: 'high', status: 'pending',
    startDate: '2025-02-20', expectedCompletion: '2025-04-15', deliveryTerms: 'Net 30',
    internalNotes: 'Foundation inspection required before phase 2', clientInstructions: 'All work to comply with NBC 2016',
    estimatedTotal: 420000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-22T09:00:00Z', updatedAt: '2025-02-22T09:00:00Z',
  },
  {
    id: 'j2', jobNumber: 'JO-2025-0080', title: 'Electrical Fittings & Panel Upgrade',
    clientId: 'c2', clientName: 'TCS Bangalore', clientContact: 'Priya Nair', clientEmail: 'priya@tcs.com', clientPhone: '+91 87654 32109',
    jobType: 'electrical', priority: 'normal', status: 'approved',
    startDate: '2025-02-15', expectedCompletion: '2025-03-10', deliveryTerms: 'Net 15',
    internalNotes: '', clientInstructions: 'Work only on weekends between 8am-6pm',
    estimatedTotal: 185000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-21T10:00:00Z', updatedAt: '2025-02-21T10:00:00Z',
  },
  {
    id: 'j3', jobNumber: 'JO-2025-0079', title: 'Plumbing Overhaul — 3rd & 4th Floor',
    clientId: 'c3', clientName: 'Wipro Campus', clientContact: 'Rajan Mehta', clientEmail: 'rajan@wipro.com', clientPhone: '+91 76543 21098',
    jobType: 'plumbing', priority: 'urgent', status: 'in_progress',
    startDate: '2025-02-10', expectedCompletion: '2025-03-01', deliveryTerms: 'Immediate',
    internalNotes: 'Pipe diameter confirmed as 25mm', clientInstructions: 'Maintain water supply to floors 1 & 2 at all times',
    estimatedTotal: 310000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-20T08:00:00Z', updatedAt: '2025-02-20T08:00:00Z',
  },
  {
    id: 'j4', jobNumber: 'JO-2025-0078', title: 'HVAC Maintenance & Duct Cleaning',
    clientId: 'c4', clientName: 'HCL Tech Park', clientContact: 'Sunita Rao', clientEmail: 'sunita@hcl.com', clientPhone: '+91 65432 10987',
    jobType: 'hvac', priority: 'normal', status: 'completed',
    startDate: '2025-01-20', expectedCompletion: '2025-02-19', deliveryTerms: 'Net 45',
    internalNotes: '', clientInstructions: '',
    estimatedTotal: 260000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-19T07:00:00Z', updatedAt: '2025-02-19T07:00:00Z',
  },
  {
    id: 'j5', jobNumber: 'JO-2025-0077', title: 'Painting & Finishing — Lobby & Reception',
    clientId: 'c5', clientName: 'Cognizant SEZ', clientContact: 'Deepak Verma', clientEmail: 'deepak@cognizant.com', clientPhone: '+91 54321 09876',
    jobType: 'painting', priority: 'low', status: 'draft',
    startDate: '2025-03-01', expectedCompletion: '2025-03-20', deliveryTerms: '',
    internalNotes: 'Client wants premium paint only', clientInstructions: '',
    estimatedTotal: 95000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-18T11:00:00Z', updatedAt: '2025-02-18T11:00:00Z',
  },
  {
    id: 'j6', jobNumber: 'JO-2025-0076', title: 'Generator Installation — Rooftop',
    clientId: 'c1', clientName: 'Infosys Ltd', clientContact: 'Ankit Sharma', clientEmail: 'ankit@infosys.com', clientPhone: '+91 98765 43210',
    jobType: 'electrical', priority: 'high', status: 'pending',
    startDate: '2025-02-25', expectedCompletion: '2025-03-25', deliveryTerms: 'Net 30',
    internalNotes: 'Crane rental required', clientInstructions: 'Noise restrictions after 6pm',
    estimatedTotal: 520000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-17T09:00:00Z', updatedAt: '2025-02-17T09:00:00Z',
  },
  {
    id: 'j7', jobNumber: 'JO-2025-0074', title: 'Security System Upgrade — CCTV & Access Control',
    clientId: 'c6', clientName: 'Accenture India', clientContact: 'Kavya Reddy', clientEmail: 'kavya@accenture.com', clientPhone: '+91 43210 98765',
    jobType: 'security', priority: 'high', status: 'pending',
    startDate: '2025-03-05', expectedCompletion: '2025-03-30', deliveryTerms: 'Net 30',
    internalNotes: '', clientInstructions: 'All cameras must cover parking area',
    estimatedTotal: 380000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-15T14:00:00Z', updatedAt: '2025-02-15T14:00:00Z',
  },
  {
    id: 'j8', jobNumber: 'JO-2025-0073', title: 'Carpentry Works — Modular Workstations',
    clientId: 'c2', clientName: 'TCS Bangalore', clientContact: 'Priya Nair', clientEmail: 'priya@tcs.com', clientPhone: '+91 87654 32109',
    jobType: 'carpentry', priority: 'normal', status: 'on_hold',
    startDate: '2025-02-28', expectedCompletion: '2025-04-10', deliveryTerms: 'Net 30',
    internalNotes: 'Material procurement delayed', clientInstructions: '',
    estimatedTotal: 145000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-14T10:00:00Z', updatedAt: '2025-02-14T10:00:00Z',
  },
  {
    id: 'j9', jobNumber: 'JO-2025-0072', title: 'IT Infrastructure — Server Room Setup',
    clientId: 'c3', clientName: 'Wipro Campus', clientContact: 'Rajan Mehta', clientEmail: 'rajan@wipro.com', clientPhone: '+91 76543 21098',
    jobType: 'it_infrastructure', priority: 'urgent', status: 'rejected',
    startDate: '2025-02-01', expectedCompletion: '2025-02-28', deliveryTerms: 'Net 15',
    internalNotes: 'Rejected due to spec mismatch', clientInstructions: '',
    estimatedTotal: 670000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-10T09:00:00Z', updatedAt: '2025-02-10T09:00:00Z',
  },
  {
    id: 'j10', jobNumber: 'JO-2025-0071', title: 'Landscaping & Garden Maintenance',
    clientId: 'c4', clientName: 'HCL Tech Park', clientContact: 'Sunita Rao', clientEmail: 'sunita@hcl.com', clientPhone: '+91 65432 10987',
    jobType: 'landscaping', priority: 'low', status: 'cancelled',
    startDate: '2025-01-15', expectedCompletion: '2025-02-15', deliveryTerms: '',
    internalNotes: 'Cancelled by client', clientInstructions: '',
    estimatedTotal: 55000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-08T12:00:00Z', updatedAt: '2025-02-08T12:00:00Z',
  },
];

let jobCounter = 82;

function generateJobNumber(): string {
  const year = new Date().getFullYear();
  const num = String(jobCounter++).padStart(4, '0');
  return `JO-${year}-${num}`;
}

export { CLIENTS };

interface JobOrderStore {
  jobs: JobOrder[];
  addJob: (data: Omit<JobOrder, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>) => JobOrder;
  updateJob: (id: string, data: Partial<JobOrder>) => void;
  deleteJob: (id: string) => void;
  duplicateJob: (id: string) => JobOrder;
}

export const useJobOrderStore = create<JobOrderStore>((set, get) => ({
  jobs: SEED_JOBS,

  addJob: (data) => {
    const job: JobOrder = {
      ...data,
      id: `j${Date.now()}`,
      jobNumber: generateJobNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ jobs: [job, ...s.jobs] }));
    return job;
  },

  updateJob: (id, data) => {
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === id ? { ...j, ...data, updatedAt: new Date().toISOString() } : j
      ),
    }));
  },

  deleteJob: (id) => {
    set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
  },

  duplicateJob: (id) => {
    const original = get().jobs.find((j) => j.id === id);
    if (!original) throw new Error('Job not found');
    const copy: JobOrder = {
      ...original,
      id: `j${Date.now()}`,
      jobNumber: generateJobNumber(),
      title: `${original.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ jobs: [copy, ...s.jobs] }));
    return copy;
  },
}));

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  civil: 'Civil', electrical: 'Electrical', plumbing: 'Plumbing', hvac: 'HVAC',
  painting: 'Painting', carpentry: 'Carpentry', it_infrastructure: 'IT Infrastructure',
  security: 'Security', landscaping: 'Landscaping', other: 'Other',
};

export const PRIORITY_CONFIG: Record<JobPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  normal: { label: 'Normal', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  high: { label: 'High', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  urgent: { label: 'Urgent', className: 'bg-red-50 text-red-700 border-red-200' },
};

export const ALL_STATUSES: JobOrderStatus[] = [
  'draft', 'pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled', 'on_hold',
];
