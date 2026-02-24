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
import type { TaxConfig } from '@/types';

const TAX_TYPE_OPTIONS = [
  { value: 'GST', label: 'GST' },
  { value: 'CGST', label: 'CGST' },
  { value: 'SGST', label: 'SGST' },
  { value: 'IGST', label: 'IGST' },
  { value: 'VAT', label: 'VAT' },
];

const SEED: TaxConfig[] = [
  { id: '1', name: 'GST 18%', taxType: 'GST', rate: 18, description: 'Standard GST rate for services', isActive: true, createdAt: '2025-01-01' },
  { id: '2', name: 'GST 12%', taxType: 'GST', rate: 12, description: 'Reduced GST for construction', isActive: true, createdAt: '2025-01-01' },
  { id: '3', name: 'CGST 9%', taxType: 'CGST', rate: 9, description: 'Central GST component', isActive: true, createdAt: '2025-01-01' },
  { id: '4', name: 'SGST 9%', taxType: 'SGST', rate: 9, description: 'State GST component', isActive: true, createdAt: '2025-01-01' },
  { id: '5', name: 'IGST 18%', taxType: 'IGST', rate: 18, description: 'Integrated GST for interstate', isActive: false, createdAt: '2025-01-01' },
];

type TaxForm = Omit<TaxConfig, 'id' | 'createdAt'>;
const BLANK: TaxForm = { name: '', taxType: 'GST', rate: 18, description: '', isActive: true };

export function TaxPage() {
  const [items, setItems] = useState<TaxConfig[]>(SEED);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TaxConfig | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxConfig | null>(null);
  const [form, setForm] = useState<TaxForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditTarget(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (r: TaxConfig) => {
    setEditTarget(r);
    setForm({ name: r.name, taxType: r.taxType, rate: r.rate, description: r.description ?? '', isActive: r.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || form.rate <= 0) { toast.error('Name and rate are required'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      setItems((prev) => prev.map((i) => i.id === editTarget.id ? { ...i, ...form } : i));
      toast.success('Tax config updated');
    } else {
      setItems((prev) => [...prev, { id: String(Date.now()), ...form, createdAt: new Date().toISOString() }]);
      toast.success('Tax config created');
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success('Tax config deleted');
    setDeleteTarget(null);
  };

  const taxTypeColor: Record<string, 'primary' | 'success' | 'warning' | 'neutral'> = {
    GST: 'primary', CGST: 'success', SGST: 'warning', IGST: 'neutral', VAT: 'neutral',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Tax Setup</h2>
          <p className="text-sm text-neutral-500">GST/VAT/IGST configurations applied to invoices</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Tax</Button>
      </div>
      <Input placeholder="Search tax configs..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} className="max-w-xs" />

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <Table
          columns={[
            { key: 'name', header: 'Name', render: (r) => (
              <div>
                <p className="font-medium text-neutral-900">{r.name}</p>
                {r.description && <p className="text-xs text-neutral-500">{r.description}</p>}
              </div>
            )},
            { key: 'taxType', header: 'Tax Type', render: (r) => (
              <Badge variant={taxTypeColor[r.taxType] ?? 'neutral'}>{r.taxType}</Badge>
            )},
            { key: 'rate', header: 'Rate', render: (r) => (
              <span className="font-semibold text-neutral-900">{r.rate}%</span>
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
          emptyState={<EmptyState heading="No tax configurations" subtext="Set up GST/VAT/IGST rates for invoicing" ctaLabel="Add Tax" onCta={openCreate} />}
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editTarget ? 'Edit Tax Config' : 'Add Tax Config'}>
        <div className="space-y-4">
          <Input label="Display Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. GST 18%" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tax Type" value={form.taxType} onChange={(e) => setForm((p) => ({ ...p, taxType: e.target.value as TaxConfig['taxType'] }))} options={TAX_TYPE_OPTIONS} />
            <Input label="Rate (%)" type="number" min="0" max="100" value={form.rate} onChange={(e) => setForm((p) => ({ ...p, rate: Number(e.target.value) }))} />
          </div>
          <Input label="Description" value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} loading={saving}>{editTarget ? 'Save Changes' : 'Create'}</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Tax Config" consequence={`Delete "${deleteTarget?.name}"? Active invoices using this rate won't be affected.`} confirmLabel="Delete" />
    </div>
  );
}
