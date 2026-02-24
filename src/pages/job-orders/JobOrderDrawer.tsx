import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, AlertTriangle, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { useJobOrderStore, CLIENTS, JOB_TYPE_LABELS, PRIORITY_CONFIG } from '@/stores/jobOrderStore';
import type { JobOrder, JobPriority, JobType, JobOrderStatus } from '@/types';

const LOCKED_STATUSES: JobOrderStatus[] = ['approved', 'in_progress', 'completed'];

const JOB_TYPES: { value: JobType; label: string }[] = Object.entries(JOB_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as JobType, label })
);

const PRIORITIES: JobPriority[] = ['low', 'normal', 'high', 'urgent'];

interface FormState {
  title: string;
  clientId: string;
  clientContact: string;
  clientEmail: string;
  clientPhone: string;
  jobType: JobType;
  priority: JobPriority;
  startDate: string;
  expectedCompletion: string;
  deliveryTerms: string;
  internalNotes: string;
  clientInstructions: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  clientId: '',
  clientContact: '',
  clientEmail: '',
  clientPhone: '',
  jobType: 'corrugated_cardboard',
  priority: 'normal',
  startDate: '',
  expectedCompletion: '',
  deliveryTerms: '',
  internalNotes: '',
  clientInstructions: '',
};

interface JobOrderDrawerProps {
  open: boolean;
  job?: JobOrder | null;
  onClose: () => void;
  onSaved?: (job: JobOrder) => void;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-neutral-600 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 mt-5 first:mt-0">
      {children}
    </h3>
  );
}

export function JobOrderDrawer({ open, job, onClose, onSaved }: JobOrderDrawerProps) {
  const { addJob, updateJob, deleteJob } = useJobOrderStore();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientDropOpen, setClientDropOpen] = useState(false);
  const clientDropRef = useRef<HTMLDivElement>(null);

  const isEdit = !!job;
  const isLocked = job ? LOCKED_STATUSES.includes(job.status) : false;
  const canDelete = isEdit && job?.status === 'draft';

  useEffect(() => {
    if (open) {
      if (job) {
        setForm({
          title: job.title,
          clientId: job.clientId,
          clientContact: job.clientContact,
          clientEmail: job.clientEmail,
          clientPhone: job.clientPhone,
          jobType: job.jobType,
          priority: job.priority,
          startDate: job.startDate,
          expectedCompletion: job.expectedCompletion,
          deliveryTerms: job.deliveryTerms ?? '',
          internalNotes: job.internalNotes ?? '',
          clientInstructions: job.clientInstructions ?? '',
        });
        setClientSearch(job.clientName);
      } else {
        setForm(EMPTY_FORM);
        setClientSearch('');
      }
      setErrors({});
      setIsDirty(false);
      setShowDeleteConfirm(false);
      setShowCancelConfirm(false);
    }
  }, [open, job]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (clientDropRef.current && !clientDropRef.current.contains(e.target as Node)) {
        setClientDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setIsDirty(true);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function selectClient(clientId: string) {
    const client = CLIENTS.find((c) => c.id === clientId);
    if (!client) return;
    setForm((f) => ({
      ...f,
      clientId: client.id,
      clientContact: client.contact,
      clientEmail: client.email,
      clientPhone: client.phone,
    }));
    setClientSearch(client.name);
    setClientDropOpen(false);
    setIsDirty(true);
    if (errors.clientId) setErrors((e) => ({ ...e, clientId: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) e.title = 'Job title is required';
    if (form.title.length > 200) e.title = 'Max 200 characters';
    if (!form.clientId) e.clientId = 'Client is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.expectedCompletion) e.expectedCompletion = 'Expected completion is required';
    if (form.startDate && form.expectedCompletion && form.expectedCompletion <= form.startDate) {
      e.expectedCompletion = 'Must be after start date';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSaveDraft() {
    if (!validate()) return;
    save('draft');
  }

  function handleSaveStart() {
    if (!validate()) return;
    save(isEdit ? job!.status : 'draft');
  }

  function save(status: JobOrderStatus) {
    const selectedClient = CLIENTS.find((c) => c.id === form.clientId);
    const payload = {
      title: form.title.trim(),
      clientId: form.clientId,
      clientName: selectedClient?.name ?? '',
      clientContact: form.clientContact,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      jobType: form.jobType,
      priority: form.priority,
      status,
      startDate: form.startDate,
      expectedCompletion: form.expectedCompletion,
      deliveryTerms: form.deliveryTerms,
      internalNotes: form.internalNotes,
      clientInstructions: form.clientInstructions,
      attachments: job?.attachments ?? [],
      createdBy: 'Admin User',
    };
    let saved: JobOrder;
    if (isEdit) {
      updateJob(job!.id, payload);
      saved = { ...job!, ...payload, updatedAt: new Date().toISOString() };
    } else {
      saved = addJob(payload);
    }
    onSaved?.(saved);
    onClose();
  }

  function handleDelete() {
    deleteJob(job!.id);
    onClose();
  }

  function handleClose() {
    if (isDirty && !isLocked) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  }

  const filteredClients = CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const inputCls = (err?: string) =>
    cn(
      'w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400',
      'focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors',
      err ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-neutral-200',
      isLocked && 'bg-neutral-50 cursor-not-allowed opacity-75'
    );

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 z-40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl',
          'transition-transform duration-300 ease-in-out sm:w-[560px]',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              {isEdit ? (isLocked ? 'View Job Order' : 'Edit Job Order') : 'New Job Order'}
            </h2>
            {job && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono text-neutral-500">{job.jobNumber}</span>
                <StatusBadge status={job.status} />
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Locked banner */}
        {isLocked && (
          <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            This job order is locked and cannot be edited.
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Job Details */}
          <SectionHeader>Job Details</SectionHeader>

          <div className="space-y-3">
            <div>
              <FieldLabel required>Job Title / Description</FieldLabel>
              <textarea
                rows={2}
                maxLength={200}
                disabled={isLocked}
                placeholder="Brief description of the job (max 200 chars)"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className={cn(inputCls(errors.title), 'resize-none')}
              />
              <div className="flex justify-between mt-0.5">
                {errors.title ? (
                  <span className="text-xs text-red-500">{errors.title}</span>
                ) : <span />}
                <span className="text-xs text-neutral-400">{form.title.length}/200</span>
              </div>
            </div>

            <div ref={clientDropRef} className="relative">
              <FieldLabel required>Client Name</FieldLabel>
              <div className="relative">
                <input
                  type="text"
                  disabled={isLocked}
                  placeholder="Search client..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setClientDropOpen(true);
                    if (!e.target.value) setField('clientId', '');
                  }}
                  onFocus={() => setClientDropOpen(true)}
                  className={cn(inputCls(errors.clientId), 'pr-8')}
                />
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              </div>
              {errors.clientId && <span className="text-xs text-red-500 mt-0.5 block">{errors.clientId}</span>}
              {clientDropOpen && filteredClients.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
                  {filteredClients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="flex w-full flex-col px-3 py-2 text-left hover:bg-neutral-50 first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => selectClient(c.id)}
                    >
                      <span className="text-sm font-medium text-neutral-900">{c.name}</span>
                      <span className="text-xs text-neutral-400">{c.contact} · {c.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Client Contact</FieldLabel>
                <input
                  type="text"
                  disabled={isLocked}
                  placeholder="Contact person"
                  value={form.clientContact}
                  onChange={(e) => setField('clientContact', e.target.value)}
                  className={inputCls()}
                />
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <input
                  type="text"
                  disabled={isLocked}
                  placeholder="+91 98765 43210"
                  value={form.clientPhone}
                  onChange={(e) => setField('clientPhone', e.target.value)}
                  className={inputCls()}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Job Type</FieldLabel>
                <div className="relative">
                  <select
                    disabled={isLocked}
                    value={form.jobType}
                    onChange={(e) => setField('jobType', e.target.value as JobType)}
                    className={cn(inputCls(), 'appearance-none pr-8')}
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>
              <div>
                <FieldLabel>Priority</FieldLabel>
                <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setField('priority', p)}
                      className={cn(
                        'flex-1 py-2 text-xs font-medium transition-colors border-r last:border-r-0 border-neutral-200',
                        form.priority === p
                          ? cn(PRIORITY_CONFIG[p].className, 'border-transparent')
                          : 'bg-white text-neutral-500 hover:bg-neutral-50',
                        isLocked && 'cursor-not-allowed'
                      )}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <SectionHeader>Dates</SectionHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>Start Date</FieldLabel>
                <input
                  type="date"
                  disabled={isLocked}
                  value={form.startDate}
                  onChange={(e) => setField('startDate', e.target.value)}
                  className={inputCls(errors.startDate)}
                />
                {errors.startDate && <span className="text-xs text-red-500 mt-0.5 block">{errors.startDate}</span>}
              </div>
              <div>
                <FieldLabel required>Expected Completion</FieldLabel>
                <input
                  type="date"
                  disabled={isLocked}
                  value={form.expectedCompletion}
                  onChange={(e) => setField('expectedCompletion', e.target.value)}
                  className={inputCls(errors.expectedCompletion)}
                />
                {errors.expectedCompletion && <span className="text-xs text-red-500 mt-0.5 block">{errors.expectedCompletion}</span>}
              </div>
            </div>
            <div>
              <FieldLabel>Delivery Terms</FieldLabel>
              <input
                type="text"
                disabled={isLocked}
                placeholder="e.g. Net 30, Immediate"
                value={form.deliveryTerms}
                onChange={(e) => setField('deliveryTerms', e.target.value)}
                className={inputCls()}
              />
            </div>
          </div>

          {/* Notes */}
          <SectionHeader>Notes</SectionHeader>
          <div className="space-y-3">
            <div>
              <FieldLabel>Internal Notes</FieldLabel>
              <p className="text-xs text-neutral-400 mb-1">Hidden from client documents</p>
              <textarea
                rows={3}
                disabled={isLocked}
                placeholder="Notes visible only to internal team..."
                value={form.internalNotes}
                onChange={(e) => setField('internalNotes', e.target.value)}
                className={cn(inputCls(), 'resize-none')}
              />
            </div>
            <div>
              <FieldLabel>Client Instructions</FieldLabel>
              <p className="text-xs text-neutral-400 mb-1">Shown on client-facing PDF</p>
              <textarea
                rows={3}
                disabled={isLocked}
                placeholder="Special instructions or requirements from client..."
                value={form.clientInstructions}
                onChange={(e) => setField('clientInstructions', e.target.value)}
                className={cn(inputCls(), 'resize-none')}
              />
            </div>
          </div>

          {/* Attachments */}
          <SectionHeader>Attachments</SectionHeader>
          <div>
            {!isLocked && (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 p-6 text-center hover:border-[#1B4F9C]/40 hover:bg-neutral-50 transition-colors">
                <Upload className="h-6 w-6 text-neutral-300" />
                <div>
                  <p className="text-sm font-medium text-neutral-700">Click to upload files</p>
                  <p className="text-xs text-neutral-400 mt-0.5">PDF, JPG, PNG, DOCX — max 10 MB each</p>
                </div>
                <input type="file" className="sr-only" multiple accept=".pdf,.jpg,.jpeg,.png,.docx" />
              </label>
            )}
            {job?.attachments && job.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {job.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 px-3 py-2">
                    <FileText className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="flex-1 text-sm text-neutral-700 truncate">{att.name}</span>
                    <span className="text-xs text-neutral-400">{(att.size / 1024).toFixed(0)} KB</span>
                    {!isLocked && (
                      <button className="text-neutral-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {(!job?.attachments || job.attachments.length === 0) && isLocked && (
              <p className="text-sm text-neutral-400 italic">No attachments</p>
            )}
          </div>

          {/* Danger zone */}
          {canDelete && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
              <h4 className="text-xs font-semibold text-red-700 mb-1">Danger Zone</h4>
              <p className="text-xs text-red-600 mb-3">Permanently delete this draft job order. This cannot be undone.</p>
              {showDeleteConfirm ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    Yes, delete permanently
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  Delete Job Order
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLocked && (
          <div className="border-t border-neutral-200 px-5 py-4 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <div className="flex-1" />
              <button
                onClick={handleSaveDraft}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={handleSaveStart}
                className="rounded-lg bg-[#1B4F9C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#174287] transition-colors"
              >
                {isEdit ? 'Save Changes' : 'Save & Start Estimation'}
              </button>
            </div>
          </div>
        )}
        {isLocked && (
          <div className="border-t border-neutral-200 px-5 py-4 shrink-0">
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </aside>

      {/* Cancel confirm modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-neutral-200 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Discard changes?</h3>
            <p className="text-sm text-neutral-500 mb-5">You have unsaved changes. They will be lost if you close now.</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowCancelConfirm(false); onClose(); }}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Keep editing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
