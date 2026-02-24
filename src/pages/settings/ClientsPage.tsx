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
import type { Client } from '@/types';

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

const PAYMENT_TERMS = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'net15', label: 'Net 15 days' },
  { value: 'net30', label: 'Net 30 days' },
  { value: 'net45', label: 'Net 45 days' },
  { value: 'net60', label: 'Net 60 days' },
];

const SEED: Client[] = [
  { id: '1', name: 'Infosys Ltd', contactPerson: 'Rahul Mehta', email: 'rahul@infosys.com', phone: '+91 80 4116 7000', address: 'Electronics City', city: 'Bengaluru', state: 'Karnataka', country: 'India', currency: 'INR', gstin: '29AABCI1234F1Z5', paymentTerms: 'net30', isActive: true, createdAt: '2025-01-05' },
  { id: '2', name: 'TCS Bangalore', contactPerson: 'Ananya Singh', email: 'ananya@tcs.com', phone: '+91 80 6724 8000', address: 'Bagmane Tech Park', city: 'Bengaluru', state: 'Karnataka', country: 'India', currency: 'INR', paymentTerms: 'net45', isActive: true, createdAt: '2025-01-08' },
  { id: '3', name: 'Wipro Campus', contactPerson: 'Kiran Rao', email: 'kiran@wipro.com', phone: '+91 80 2844 0011', address: 'Sarjapur Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', currency: 'INR', paymentTerms: 'net30', isActive: true, createdAt: '2025-01-10' },
  { id: '4', name: 'HCL Tech Park', contactPerson: 'Sunita Nair', email: 'sunita@hcl.com', phone: '+91 120 676 5000', address: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', country: 'India', currency: 'INR', paymentTerms: 'net60', isActive: false, createdAt: '2025-01-15' },
];

type ClientForm = Omit<Client, 'id' | 'createdAt'>;
const BLANK: ClientForm = { name: '', contactPerson: '', email: '', phone: '', address: '', city: '', state: '', country: 'India', pincode: '', currency: 'INR', gstin: '', pan: '', paymentTerms: 'net30', isActive: true };

export function ClientsPage() {
  const [items, setItems] = useState<Client[]>(SEED);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase())
  );

  const set = (field: keyof ClientForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const openCreate = () => { setEditTarget(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (c: Client) => {
    setEditTarget(c);
    setForm({ name: c.name, contactPerson: c.contactPerson, email: c.email, phone: c.phone, address: c.address, city: c.city, state: c.state, country: c.country, pincode: c.pincode ?? '', currency: c.currency, gstin: c.gstin ?? '', pan: c.pan ?? '', creditLimit: c.creditLimit, paymentTerms: c.paymentTerms ?? 'net30', isActive: c.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      setItems((prev) => prev.map((i) => i.id === editTarget.id ? { ...i, ...form } : i));
      toast.success('Client updated');
    } else {
      setItems((prev) => [...prev, { id: String(Date.now()), ...form, createdAt: new Date().toISOString() }]);
      toast.success('Client created');
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success('Client deleted');
    setDeleteTarget(null);
  };

  const toggleStatus = (c: Client) => {
    setItems((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Client Master</h2>
          <p className="text-sm text-neutral-500">{items.length} clients · {items.filter((i) => i.isActive).length} active</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Client</Button>
      </div>
      <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} className="max-w-xs" />

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <Table
          columns={[
            { key: 'name', header: 'Client', render: (c) => (
              <div>
                <p className="font-medium text-neutral-900">{c.name}</p>
                <p className="text-xs text-neutral-500">{c.contactPerson} · {c.email}</p>
              </div>
            )},
            { key: 'city', header: 'Location', render: (c) => `${c.city}, ${c.state}` },
            { key: 'currency', header: 'Currency', render: (c) => <Badge variant="neutral">{c.currency}</Badge> },
            { key: 'paymentTerms', header: 'Payment Terms', render: (c) => (
              <span className="capitalize">{PAYMENT_TERMS.find((p) => p.value === c.paymentTerms)?.label ?? c.paymentTerms}</span>
            )},
            { key: 'isActive', header: 'Status', render: (c) => <Badge variant={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Active' : 'Inactive'}</Badge> },
            { key: 'actions', header: '', render: (c) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={(e) => { e.stopPropagation(); toggleStatus(c); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100" title="Toggle status">
                  {c.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ), className: 'w-32' },
          ]}
          data={filtered}
          keyExtractor={(c) => c.id}
          emptyState={<EmptyState heading="No clients yet" subtext="Add clients to associate with job orders" ctaLabel="Add Client" onCta={openCreate} />}
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editTarget ? 'Edit Client' : 'Add Client'} size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Input label="Company Name" value={form.name} onChange={set('name')} placeholder="e.g. Infosys Ltd" /></div>
            <Input label="Contact Person" value={form.contactPerson} onChange={set('contactPerson')} />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} />
            <Input label="Phone" value={form.phone} onChange={set('phone')} />
            <Select label="Currency" value={form.currency} onChange={set('currency')} options={CURRENCY_OPTIONS} />
            <div className="col-span-2"><Input label="Address" value={form.address} onChange={set('address')} /></div>
            <Input label="City" value={form.city} onChange={set('city')} />
            <Input label="State" value={form.state} onChange={set('state')} />
            <Input label="Country" value={form.country} onChange={set('country')} />
            <Input label="Pincode" value={form.pincode ?? ''} onChange={set('pincode')} />
            <Input label="GSTIN" value={form.gstin ?? ''} onChange={set('gstin')} placeholder="29AABCA1234F1Z5" />
            <Input label="PAN" value={form.pan ?? ''} onChange={set('pan')} placeholder="AABCA1234F" />
            <Select label="Payment Terms" value={form.paymentTerms ?? 'net30'} onChange={set('paymentTerms')} options={PAYMENT_TERMS} />
            <Input label="Credit Limit (₹)" type="number" value={form.creditLimit ?? ''} onChange={(e) => setForm((p) => ({ ...p, creditLimit: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-4">
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} loading={saving}>{editTarget ? 'Save Changes' : 'Create Client'}</Button>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Client" consequence={`Delete "${deleteTarget?.name}"? This will not affect existing job orders.`} confirmLabel="Delete" />
    </div>
  );
}
