import { useState } from 'react';
import { CheckCircle2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { ClientApprovalRecord } from '@/types';

interface Props {
  estimateId: string;
  existingApproval?: ClientApprovalRecord;
  onRecord: (id: string, data: ClientApprovalRecord) => void;
}

const inputCls = 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors';

const APPROVAL_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'signed_copy', label: 'Signed Copy' },
  { value: 'verbal', label: 'Verbal' },
] as const;

export function ClientApprovalPanel({ estimateId, existingApproval, onRecord }: Props) {
  const [approvedOn, setApprovedOn] = useState('');
  const [approvalMethod, setApprovalMethod] = useState<ClientApprovalRecord['approvalMethod']>('email');
  const [referenceNotes, setReferenceNotes] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);

  if (existingApproval) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Client Approved</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Recorded on {formatDate(existingApproval.approvedOn)} via{' '}
              <span className="font-medium capitalize">{existingApproval.approvalMethod.replace('_', ' ')}</span>
              {' '}by {existingApproval.recordedBy}
            </p>
            {existingApproval.referenceNotes && (
              <p className="text-xs text-emerald-700 mt-1 italic">"{existingApproval.referenceNotes}"</p>
            )}
            {existingApproval.proofFileName && (
              <p className="text-xs text-emerald-600 mt-1">📎 {existingApproval.proofFileName}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!approvedOn) e.approvedOn = 'Approval date is required';
    if (!approvalMethod) e.approvalMethod = 'Approval method is required';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!confirmed) { setErrors({ confirm: 'Please confirm before marking as approved.' }); return; }
    onRecord(estimateId, {
      approvedOn,
      approvalMethod,
      referenceNotes: referenceNotes.trim() || undefined,
      proofFileName: proofFileName.trim() || undefined,
      recordedBy: 'Admin User',
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setProofFileName(file.name);
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-violet-100 bg-violet-50/60 px-5 py-3.5">
        <CheckCircle2 className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-semibold text-violet-900">Record Client Approval</h3>
        <span className="ml-auto text-xs text-violet-500">Status: Awaiting Client</span>
      </div>

      <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Approval Date */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
            Approval Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={approvedOn}
            onChange={(e) => { setApprovedOn(e.target.value); setErrors((p) => ({ ...p, approvedOn: '' })); }}
            className={cn(inputCls, errors.approvedOn && 'border-red-400 focus:border-red-400')}
          />
          {errors.approvedOn && <p className="text-xs text-red-500 mt-1">{errors.approvedOn}</p>}
        </div>

        {/* Approval Method */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
            Approval Method <span className="text-red-500">*</span>
          </label>
          <select
            value={approvalMethod}
            onChange={(e) => { setApprovalMethod(e.target.value as ClientApprovalRecord['approvalMethod']); setErrors((p) => ({ ...p, approvalMethod: '' })); }}
            className={cn(inputCls, errors.approvalMethod && 'border-red-400')}
          >
            {APPROVAL_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {errors.approvalMethod && <p className="text-xs text-red-500 mt-1">{errors.approvalMethod}</p>}
        </div>

        {/* Reference / Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Reference / Notes</label>
          <input
            type="text"
            placeholder="e.g. Email thread ID, WhatsApp screenshot reference..."
            value={referenceNotes}
            onChange={(e) => setReferenceNotes(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Proof upload */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Upload Approval Proof</label>
          <label className="flex items-center gap-3 rounded-lg border border-dashed border-neutral-300 px-4 py-3 cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors">
            <Upload className="h-4 w-4 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              {proofFileName ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700 truncate">{proofFileName}</span>
                  <button
                    onClick={(e) => { e.preventDefault(); setProofFileName(''); }}
                    className="text-neutral-400 hover:text-red-500 shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-neutral-500">Click to upload (JPG, PNG, PDF, DOCX)</p>
                  <p className="text-xs text-neutral-400">Max 10 MB</p>
                </>
              )}
            </div>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf,.docx" className="sr-only" onChange={handleFileChange} />
          </label>
        </div>

        {/* Confirm checkbox */}
        <div className="sm:col-span-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => { setConfirmed(e.target.checked); setErrors((p) => ({ ...p, confirm: '' })); }}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-[#1B4F9C]"
            />
            <span className="text-xs text-neutral-600">
              I confirm that the client has approved this estimate and the details above are accurate.
            </span>
          </label>
          {errors.confirm && <p className="text-xs text-red-500 mt-1 ml-6">{errors.confirm}</p>}
        </div>

        {/* Submit */}
        <div className="sm:col-span-2">
          <button
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as Client-Approved
          </button>
        </div>
      </div>
    </div>
  );
}
