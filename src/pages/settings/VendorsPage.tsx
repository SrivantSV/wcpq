import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { Table } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import type { Vendor } from '@/types';

const VENDOR_TYPES = [
  { value: 'material_supplier', label: 'Material Supplier' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'equipment', label: 'Equipment Vendor' },
  { value: 'labor', label: 'Labour Agency' },
  { value: 'service', label: 'Service Provider' },
];

const SEED: Vendor[] = [
  { id: '1', name: 'Raj Steels Pvt Ltd', contactPerson: 'Rajesh Kumar', email: 'rk@rajsteels.com', phone: '+91 9845001234', address: 'Yeshwanthpur', city: 'Bengaluru', state: 'Karnataka', country: 'India', vendorType: 'material_supplier', gstin: '29AABCR1234F1Z5', isActive: true, createdAt: '2025-01-05' },
  { id: '2', name: 'Apex Electricals', contactPerson: 'Suresh Nair', email: 'suresh@apexelec.com', phone: '+91 9876543210', address: 'Peenya Industrial', city: 'Bengaluru', state: 'Karnataka', country: 'India', vendorType: 'subcontractor', isActive: true, createdAt: '2025-01-08' },
  { id: '3', name: 'FastFix Plumbing Co', contactPerson: 'Dinesh Verma', email: 'dv@fastfix.in', phone: '+91 8765432109', address: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', country: 'India', vendorType: 'subcontractor', isActive: true, createdAt: '2025-01-10' },
  { id: '4', name: 'Bharat Equipment Hire', contactPerson: 'Mohan Das', email: 'md@bharateq.com', phone: '+91 7654321098', address: 'Tumkur Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', vendorType: 'equipment', isActive: false, createdAt: '2025-01-12' },
];

type VendorForm = Omit<Vendor, 'id' | 'createdAt'>;
const BLANK: VendorForm = { name: '', contactPerson: '', email: '', phone: '', address: '', city: '', state: '', country: 'India', pincode: '', vendorType: 'material_supplier', gstin: '', pan: '', bankAccountNo: '', bankIfsc: '', bankName: '', isActive: true };

export function VendorsPage() {
  const [items, setItems] = useState<Vendor[]>(SEED);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [form, setForm] = useState<VendorForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.vendorType.includes(search.toLowerCase())
  );

  const set = (field: keyof VendorForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const openCreate = () => { setEditTarget(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (v: Vendor) => {
    setEditTarget(v);
    setForm({ name: v.name, contactPerson: v.contactPerson, email: v.email, phone: v.phone, address: v.address, city: v.city, state: v.state, country: v.country, pincode: v.pincode ?? '', vendorType: v.vendorType, gstin: v.gstin ?? '', pan: v.pan ?? '', bankAccountNo: v.bankAccountNo ?? '', bankIfsc: v.bankIfsc ?? '', bankName: v.bankName ?? '', isActive: v.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      setItems((prev) => prev.map((i) => i.id === editTarget.id ? { ...i, ...form } : i));
      toast.success('Vendor updated');
    } else {
      setItems((prev) => [...prev, { id: String(Date.now()), ...form, createdAt: new Date().toISOString() }]);
      toast.success('Vendor created');
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success('Vendor deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Vendor Master</h2>
          <p className="text-sm text-neutral-500">{items.length} vendors · {items.filter((i) => i.isActive).length} active</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Vendor</Button>
      </div>
      <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} className="max-w-xs" />

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <Table
          columns={[
            { key: 'name', header: 'Vendor', render: (v) => (
              <div>
                <p className="font-medium text-neutral-900">{v.name}</p>
                <p className="text-xs text-neutral-500">{v.contactPerson} · {v.email}</p>
              </div>
            )},
            { key: 'vendorType', header: 'Type', render: (v) => (
              <Badge variant="primary">{VENDOR_TYPES.find((t) => t.value === v.vendorType)?.label ?? v.vendorType}</Badge>
            )},
            { key: 'city', header: 'Location', render: (v) => `${v.city}, ${v.state}` },
            { key: 'isActive', header: 'Status', render: (v) => <Badge variant={v.isActive ? 'success' : 'neutral'}>{v.isActive ? 'Active' : 'Inactive'}</Badge> },
            { key: 'actions', header: '', render: (v) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={(e) => { e.stopPropagation(); setItems((prev) => prev.map((x) => x.id === v.id ? { ...x, isActive: !x.isActive } : x)); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100">
                  {v.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); openEdit(v); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(v); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ), className: 'w-32' },
          ]}
          data={filtered}
          keyExtractor={(v) => v.id}
          emptyState={<EmptyState heading="No vendors yet" subtext="Add vendors for materials and subcontracting" ctaLabel="Add Vendor" onCta={openCreate} />}
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editTarget ? 'Edit Vendor' : 'Add Vendor'} size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Input label="Vendor / Company Name" value={form.name} onChange={set('name')} /></div>
            <Input label="Contact Person" value={form.contactPerson} onChange={set('contactPerson')} />
            <Select label="Vendor Type" value={form.vendorType} onChange={set('vendorType')} options={VENDOR_TYPES} />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} />
            <Input label="Phone" value={form.phone} onChange={set('phone')} />
            <div className="col-span-2"><Input label="Address" value={form.address} onChange={set('address')} /></div>
            <Input label="City" value={form.city} onChange={set('city')} />
            <Input label="State" value={form.state} onChange={set('state')} />
            <Input label="Country" value={form.country} onChange={set('country')} />
            <Input label="Pincode" value={form.pincode ?? ''} onChange={set('pincode')} />
          </div>
          <div className="border-t border-neutral-100 pt-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Tax & Banking</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="GSTIN" value={form.gstin ?? ''} onChange={set('gstin')} />
              <Input label="PAN" value={form.pan ?? ''} onChange={set('pan')} />
              <Input label="Bank Name" value={form.bankName ?? ''} onChange={set('bankName')} />
              <Input label="Account Number" value={form.bankAccountNo ?? ''} onChange={set('bankAccountNo')} />
              <Input label="IFSC Code" value={form.bankIfsc ?? ''} onChange={set('bankIfsc')} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-4">
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} loading={saving}>{editTarget ? 'Save Changes' : 'Create Vendor'}</Button>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Vendor" consequence={`Delete "${deleteTarget?.name}"? This won't affect existing job orders.`} confirmLabel="Delete" />
    </div>
  );
}
