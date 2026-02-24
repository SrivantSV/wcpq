import { create } from 'zustand';
import type { JobOrder, JobOrderStatus, JobPriority, JobType } from '@/types';

const CLIENTS = [
  { id: 'c1',  name: 'Vestas',                    contact: 'Arjun Pillai',    email: 'arjun.pillai@vestas.com',       phone: '+91 98765 43210' },
  { id: 'c2',  name: 'Siemens',                   contact: 'Meera Krishnan',  email: 'meera.k@siemens.com',           phone: '+91 87654 32109' },
  { id: 'c3',  name: 'Gamesa',                    contact: 'Rajan Mehta',     email: 'rajan.mehta@gamesa.com',        phone: '+91 76543 21098' },
  { id: 'c4',  name: 'Goldwind',                  contact: 'Sunita Rao',      email: 'sunita.rao@goldwind.com',       phone: '+91 65432 10987' },
  { id: 'c5',  name: 'BHEL',                      contact: 'Deepak Verma',    email: 'deepak.verma@bhel.in',          phone: '+91 54321 09876' },
  { id: 'c6',  name: 'Thermax Ltd',               contact: 'Kavya Reddy',     email: 'kavya.reddy@thermax.com',       phone: '+91 43210 98765' },
  { id: 'c7',  name: 'Jyoti CNC Automation Ltd',  contact: 'Nikhil Desai',    email: 'nikhil.desai@jyoticnc.com',    phone: '+91 93456 78901' },
  { id: 'c8',  name: 'Kennametal India Ltd',       contact: 'Preethi Iyer',    email: 'preethi.iyer@kennametal.com',  phone: '+91 92345 67890' },
  { id: 'c9',  name: 'Kirloskar Oil Engines Ltd',  contact: 'Suresh Patil',    email: 'suresh.patil@kirloskar.com',   phone: '+91 91234 56789' },
  { id: 'c10', name: 'John Deere',                 contact: 'Anjali Sharma',   email: 'anjali.sharma@johndeere.com',  phone: '+91 90123 45678' },
  { id: 'c11', name: 'Lakshmi Machine Works Ltd',  contact: 'Vijay Kumar',     email: 'vijay.kumar@lmw.co.in',        phone: '+91 89012 34567' },
];

const SEED_JOBS: JobOrder[] = [
  {
    id: 'j1', jobNumber: 'JO-2025-0081', title: 'Corrugated Box Supply — Wind Turbine Blade Components',
    clientId: 'c1', clientName: 'Vestas', clientContact: 'Arjun Pillai', clientEmail: 'arjun.pillai@vestas.com', clientPhone: '+91 98765 43210',
    jobType: 'corrugated_cardboard', priority: 'high', status: 'pending',
    startDate: '2025-02-20', expectedCompletion: '2025-04-15', deliveryTerms: 'Net 30',
    internalNotes: 'Double-wall corrugated required for heavy blade components; moisture barrier liner needed', clientInstructions: 'All boxes must carry load-bearing rating of min 500 kg',
    estimatedTotal: 420000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-22T09:00:00Z', updatedAt: '2025-02-22T09:00:00Z',
  },
  {
    id: 'j2', jobNumber: 'JO-2025-0080', title: 'Wooden Crates & Pallets — Generator Set Export',
    clientId: 'c2', clientName: 'Siemens', clientContact: 'Meera Krishnan', clientEmail: 'meera.k@siemens.com', clientPhone: '+91 87654 32109',
    jobType: 'wooden_crates', priority: 'normal', status: 'approved',
    startDate: '2025-02-15', expectedCompletion: '2025-03-10', deliveryTerms: 'Net 15',
    internalNotes: 'ISPM-15 heat-treated timber mandatory for export', clientInstructions: 'Stencil "Fragile — Electronic Equipment" on all four sides',
    estimatedTotal: 185000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-21T10:00:00Z', updatedAt: '2025-02-21T10:00:00Z',
  },
  {
    id: 'j3', jobNumber: 'JO-2025-0079', title: 'Metal Drum Packaging — Turbine Gearbox Oil',
    clientId: 'c3', clientName: 'Gamesa', clientContact: 'Rajan Mehta', clientEmail: 'rajan.mehta@gamesa.com', clientPhone: '+91 76543 21098',
    jobType: 'metal_packaging', priority: 'urgent', status: 'in_progress',
    startDate: '2025-02-10', expectedCompletion: '2025-03-01', deliveryTerms: 'Immediate',
    internalNotes: 'UN-certified 200L steel drums required; internal epoxy coating for corrosion resistance', clientInstructions: 'GHS hazard labels to be applied before dispatch',
    estimatedTotal: 310000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-20T08:00:00Z', updatedAt: '2025-02-20T08:00:00Z',
  },
  {
    id: 'j4', jobNumber: 'JO-2025-0078', title: 'Specialty VCI Packaging — Precision Machined Parts',
    clientId: 'c4', clientName: 'Goldwind', clientContact: 'Sunita Rao', clientEmail: 'sunita.rao@goldwind.com', clientPhone: '+91 65432 10987',
    jobType: 'specialty_materials', priority: 'normal', status: 'completed',
    startDate: '2025-01-20', expectedCompletion: '2025-02-19', deliveryTerms: 'Net 45',
    internalNotes: 'VCI poly bags + silica gel desiccant packs per pallet; humidity indicator cards to be included', clientInstructions: 'No bare-hand contact with bare metal surfaces during packing',
    estimatedTotal: 260000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-19T07:00:00Z', updatedAt: '2025-02-19T07:00:00Z',
  },
  {
    id: 'j5', jobNumber: 'JO-2025-0077', title: 'Corrugated Packaging — Boiler Heat Exchanger Fins',
    clientId: 'c5', clientName: 'BHEL', clientContact: 'Deepak Verma', clientEmail: 'deepak.verma@bhel.in', clientPhone: '+91 54321 09876',
    jobType: 'corrugated_cardboard', priority: 'low', status: 'draft',
    startDate: '2025-03-01', expectedCompletion: '2025-03-20', deliveryTerms: '',
    internalNotes: 'Custom die-cut inserts needed to prevent fin damage in transit; anti-static coating on inner liner', clientInstructions: 'Box dimensions to match BOM drawing No. BHEL-HX-2024-07',
    estimatedTotal: 95000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-18T11:00:00Z', updatedAt: '2025-02-18T11:00:00Z',
  },
  {
    id: 'j6', jobNumber: 'JO-2025-0076', title: 'Wooden Pallet Supply — Heat Recovery Systems',
    clientId: 'c6', clientName: 'Thermax Ltd', clientContact: 'Kavya Reddy', clientEmail: 'kavya.reddy@thermax.com', clientPhone: '+91 43210 98765',
    jobType: 'wooden_crates', priority: 'high', status: 'pending',
    startDate: '2025-02-25', expectedCompletion: '2025-03-25', deliveryTerms: 'Net 30',
    internalNotes: 'Euro-pallet spec 1200×800mm; load capacity 1500 kg static required', clientInstructions: 'Stretch-wrap all units after loading; corner protectors mandatory',
    estimatedTotal: 520000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-17T09:00:00Z', updatedAt: '2025-02-17T09:00:00Z',
  },
  {
    id: 'j7', jobNumber: 'JO-2025-0074', title: 'Metal Container Packaging — CNC Spindle Assemblies',
    clientId: 'c7', clientName: 'Jyoti CNC Automation Ltd', clientContact: 'Nikhil Desai', clientEmail: 'nikhil.desai@jyoticnc.com', clientPhone: '+91 93456 78901',
    jobType: 'metal_packaging', priority: 'high', status: 'pending',
    startDate: '2025-03-05', expectedCompletion: '2025-03-30', deliveryTerms: 'Net 30',
    internalNotes: 'Aluminum casing with foam-lined interior; each spindle to be individually wrapped in bubble film', clientInstructions: 'Export documentation to be affixed inside lid; max stack height 3 units',
    estimatedTotal: 380000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-15T14:00:00Z', updatedAt: '2025-02-15T14:00:00Z',
  },
  {
    id: 'j8', jobNumber: 'JO-2025-0073', title: 'Specialty Foam & Moisture Barrier — Cutting Tool Kits',
    clientId: 'c8', clientName: 'Kennametal India Ltd', clientContact: 'Preethi Iyer', clientEmail: 'preethi.iyer@kennametal.com', clientPhone: '+91 92345 67890',
    jobType: 'specialty_materials', priority: 'normal', status: 'on_hold',
    startDate: '2025-02-28', expectedCompletion: '2025-04-10', deliveryTerms: 'Net 30',
    internalNotes: 'PE foam custom-cut inserts; moisture barrier foil pouches with desiccant — procurement delayed', clientInstructions: 'Each kit box to have tamper-evident seal and batch traceability label',
    estimatedTotal: 145000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-14T10:00:00Z', updatedAt: '2025-02-14T10:00:00Z',
  },
  {
    id: 'j9', jobNumber: 'JO-2025-0072', title: 'Corrugated Export Boxes — Engine Component Dispatch',
    clientId: 'c9', clientName: 'Kirloskar Oil Engines Ltd', clientContact: 'Suresh Patil', clientEmail: 'suresh.patil@kirloskar.com', clientPhone: '+91 91234 56789',
    jobType: 'corrugated_cardboard', priority: 'urgent', status: 'rejected',
    startDate: '2025-02-01', expectedCompletion: '2025-02-28', deliveryTerms: 'Net 15',
    internalNotes: 'Rejected — spec mismatch on flute grade (B-flute requested, C-flute quoted)', clientInstructions: 'Revised quote to reflect B-flute double-wall with moisture wax coating',
    estimatedTotal: 670000, attachments: [], createdBy: 'Admin User', createdAt: '2025-02-10T09:00:00Z', updatedAt: '2025-02-10T09:00:00Z',
  },
  {
    id: 'j10', jobNumber: 'JO-2025-0071', title: 'Wooden Crates — Agricultural Equipment Parts',
    clientId: 'c10', clientName: 'John Deere', clientContact: 'Anjali Sharma', clientEmail: 'anjali.sharma@johndeere.com', clientPhone: '+91 90123 45678',
    jobType: 'wooden_crates', priority: 'low', status: 'cancelled',
    startDate: '2025-01-15', expectedCompletion: '2025-02-15', deliveryTerms: '',
    internalNotes: 'Cancelled by client — shipment postponed to Q3 2025', clientInstructions: '',
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
  corrugated_cardboard: 'Corrugated Cardboard Boxes Packaging',
  wooden_crates: 'Wooden Crates and Pallets Packaging',
  metal_packaging: 'Metal Packaging (Drums/Containers) Packaging',
  specialty_materials: 'Specialty Materials Packaging',
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
