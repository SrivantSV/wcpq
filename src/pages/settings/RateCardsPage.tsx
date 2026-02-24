import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { Table } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import type { RateCard } from '@/types';

const LABOR_TYPES = [
  { value: 'civil', label: 'Civil Engineer' },
  { value: 'electrical', label: 'Electrician' },
  { value: 'plumbing', label: 'Plumber' },
  { value: 'hvac', label: 'HVAC Technician' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'painter', label: 'Painter' },
  { value: 'supervisor', label: 'Site Supervisor' },
  { value: 'helper', label: 'Helper / Labour' },
];

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
];

const SEED: RateCard[] = [
  { id: '1', name: 'Standard Civil Rate', description: 'Regular civil work', laborType: 'civil', hourlyRate: 450, currency: 'INR', effectiveFrom: '2025-01-01', isActive: true, createdAt: '2025-01-01' },
  { id: '2', name: 'Electrical Premium', description: 'Certified electricians', laborType: 'electrical', hourlyRate: 380, currency: 'INR', effectiveFrom: '2025-01-01', isActive: true, createdAt: '2025-01-01' },
  { id: '3', name: 'Plumbing Standard', description: 'Regular plumbing work', laborType: 'plumbing', hourlyRate: 320, currency: 'INR', effectiveFrom: '2025-01-01', isActive: true, createdAt: '2025-01-01' },
  { id: '4', name: 'Site Supervisor', description: 'Senior supervisor', laborType: 'supervisor', hourlyRate: 550, currency: 'INR', effectiveFrom: '2025-01-01', isActive: false, createdAt: '2025-01-01' },
];

type RateCardForm = Omit<RateCard, 'id' | 'createdAt'>;
const BLANK: RateCardForm = { name: '', description: '', laborType: 'civil', hourlyRate: 0, currency: 'INR', effectiveFrom: '', isActive: true };

export function RateCardsPage() {
  const [items, setItems] = useState<RateCard[]>(SEED);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RateCard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RateCard | null>(null);
  const [form, setForm] = useState<RateCardForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.laborType.includes(search.toLowerCase()));

  const openCreate = () => { setEditTarget(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (r: RateCard) => { setEditTarget(r); setForm({ name: r.name, description: r.description ?? '', laborType: r.laborType, hourlyRate: r.hourlyRate, currency: r.currency, effectiveFrom: r.effectiveFrom, effectiveTo: r.effectiveTo, isActive: r.isActive }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.hourlyRate) { toast.error('Name and rate are required'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      setItems((prev) => prev.map((i) => i.id === editTarget.id ? { ...i, ...form } : i));
      toast.success('Rate card updated');
    } else {
      setItems((prev) => [...prev, { id: String(Date.now()), ...form, createdAt: new Date().toISOString() }]);
      toast.success('Rate card created');
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success('Rate card deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Rate Cards</h2>
          <p className="text-sm text-neutral-500">Labor hourly rates used in job order estimates</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Rate</Button>
      </div>
      <Input placeholder="Search rate cards..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} className="max-w-xs" />

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <Table
          columns={[
            { key: 'name', header: 'Name', render: (r) => (
              <div>
                <p className="font-medium text-neutral-900">{r.name}</p>
                {r.description && <p className="text-xs text-neutral-500">{r.description}</p>}
              </div>
            )},
            { key: 'laborType', header: 'Labor Type', render: (r) => (
              <span className="capitalize">{LABOR_TYPES.find((l) => l.value === r.laborType)?.label ?? r.laborType}</span>
            )},
            { key: 'hourlyRate', header: 'Hourly Rate', render: (r) => (
              <span className="font-semibold">{r.currency === 'INR' ? '₹' : r.currency} {r.hourlyRate.toLocaleString('en-IN')}</span>
            )},
            { key: 'effectiveFrom', header: 'Effective From', render: (r) => new Date(r.effectiveFrom).toLocaleDateString('en-IN') },
            { key: 'isActive', header: 'Status', render: (r) => <Badge variant={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
            { key: 'actions', header: '', render: (r) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ), className: 'w-24' },
          ]}
          data={filtered}
          keyExtractor={(r) => r.id}
          emptyState={<EmptyState heading="No rate cards" subtext="Define labor hourly rates for estimates" ctaLabel="Add Rate" onCta={openCreate} />}
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editTarget ? 'Edit Rate Card' : 'Add Rate Card'}>
        <div className="space-y-4">
          <Input label="Card Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Standard Civil Rate" />
          <Input label="Description" value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Labor Type" value={form.laborType} onChange={(e) => setForm((p) => ({ ...p, laborType: e.target.value }))} options={LABOR_TYPES} />
            <Select label="Currency" value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} options={CURRENCY_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hourly Rate" type="number" value={form.hourlyRate} onChange={(e) => setForm((p) => ({ ...p, hourlyRate: Number(e.target.value) }))} />
            <Input label="Effective From" type="date" value={form.effectiveFrom} onChange={(e) => setForm((p) => ({ ...p, effectiveFrom: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} loading={saving}>{editTarget ? 'Save Changes' : 'Create'}</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Rate Card" consequence={`Delete "${deleteTarget?.name}"? Jobs using this rate will retain their existing values.`} confirmLabel="Delete" />
    </div>
  );
}
