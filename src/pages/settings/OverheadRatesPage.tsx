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
import type { OverheadRate } from '@/types';

const RATE_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount (₹)' },
];

const APPLICABLE_OPTIONS = [
  { value: 'all', label: 'All Line Items' },
  { value: 'labor', label: 'Labor Only' },
  { value: 'materials', label: 'Materials Only' },
  { value: 'subcontract', label: 'Subcontract Only' },
];

const SEED: OverheadRate[] = [
  { id: '1', name: 'Admin Overhead', description: 'General admin costs', rateType: 'percentage', value: 12, applicableTo: 'all', isActive: true, createdAt: '2025-01-01' },
  { id: '2', name: 'Site Mobilization', description: 'Setup & teardown costs', rateType: 'percentage', value: 5, applicableTo: 'labor', isActive: true, createdAt: '2025-01-01' },
  { id: '3', name: 'Storage & Handling', description: 'Material storage cost', rateType: 'percentage', value: 3, applicableTo: 'materials', isActive: true, createdAt: '2025-01-01' },
  { id: '4', name: 'Safety Equipment', description: 'PPE & safety gear', rateType: 'fixed', value: 2500, applicableTo: 'all', isActive: false, createdAt: '2025-01-01' },
];

type OHForm = Omit<OverheadRate, 'id' | 'createdAt'>;
const BLANK: OHForm = { name: '', description: '', rateType: 'percentage', value: 0, applicableTo: 'all', isActive: true };

export function OverheadRatesPage() {
  const [items, setItems] = useState<OverheadRate[]>(SEED);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OverheadRate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OverheadRate | null>(null);
  const [form, setForm] = useState<OHForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditTarget(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (r: OverheadRate) => {
    setEditTarget(r);
    setForm({ name: r.name, description: r.description ?? '', rateType: r.rateType, value: r.value, applicableTo: r.applicableTo, isActive: r.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || form.value <= 0) { toast.error('Name and value are required'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      setItems((prev) => prev.map((i) => i.id === editTarget.id ? { ...i, ...form } : i));
      toast.success('Overhead rate updated');
    } else {
      setItems((prev) => [...prev, { id: String(Date.now()), ...form, createdAt: new Date().toISOString() }]);
      toast.success('Overhead rate created');
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success('Overhead rate deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Overhead Rates</h2>
          <p className="text-sm text-neutral-500">Auto-applied in cost calculations for all estimates</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Overhead</Button>
      </div>
      <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} className="max-w-xs" />

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <Table
          columns={[
            { key: 'name', header: 'Name', render: (r) => (
              <div>
                <p className="font-medium text-neutral-900">{r.name}</p>
                {r.description && <p className="text-xs text-neutral-500">{r.description}</p>}
              </div>
            )},
            { key: 'rateType', header: 'Type', render: (r) => (
              <Badge variant="neutral">{r.rateType === 'percentage' ? 'Percentage' : 'Fixed'}</Badge>
            )},
            { key: 'value', header: 'Value', render: (r) => (
              <span className="font-semibold">{r.rateType === 'percentage' ? `${r.value}%` : `₹${r.value.toLocaleString('en-IN')}`}</span>
            )},
            { key: 'applicableTo', header: 'Applies To', render: (r) => (
              <span className="capitalize">{APPLICABLE_OPTIONS.find((a) => a.value === r.applicableTo)?.label}</span>
            )},
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
          emptyState={<EmptyState heading="No overhead rates" subtext="Add overhead rates to auto-calculate costs" ctaLabel="Add Overhead" onCta={openCreate} />}
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editTarget ? 'Edit Overhead Rate' : 'Add Overhead Rate'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Admin Overhead" />
          <Input label="Description" value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Rate Type" value={form.rateType} onChange={(e) => setForm((p) => ({ ...p, rateType: e.target.value as 'percentage' | 'fixed' }))} options={RATE_TYPE_OPTIONS} />
            <Input label={form.rateType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'} type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))} />
          </div>
          <Select label="Applicable To" value={form.applicableTo} onChange={(e) => setForm((p) => ({ ...p, applicableTo: e.target.value }))} options={APPLICABLE_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} loading={saving}>{editTarget ? 'Save Changes' : 'Create'}</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Overhead Rate" consequence={`Delete "${deleteTarget?.name}"? Existing estimates using this rate won't be affected.`} confirmLabel="Delete" />
    </div>
  );
}
