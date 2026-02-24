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
import type { Staff, UserRole } from '@/types';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'approver', label: 'Approver' },
  { value: 'finance', label: 'Finance' },
  { value: 'maker', label: 'Maker / Estimator' },
];

const DEPT_OPTIONS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'estimation', label: 'Estimation' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'management', label: 'Management' },
];

const SEED: Staff[] = [
  { id: '1', name: 'Raj Kumar', employeeId: 'EMP001', designation: 'Senior Estimator', department: 'estimation', email: 'raj@cqmr.com', phone: '+91 9845001111', role: 'maker', hourlyRate: 450, joiningDate: '2023-01-15', isActive: true, createdAt: '2023-01-15' },
  { id: '2', name: 'Priya Sharma', employeeId: 'EMP002', designation: 'Approval Manager', department: 'management', email: 'priya@cqmr.com', phone: '+91 9845002222', role: 'approver', hourlyRate: 600, joiningDate: '2022-06-01', isActive: true, createdAt: '2022-06-01' },
  { id: '3', name: 'Ankit Verma', employeeId: 'EMP003', designation: 'Finance Head', department: 'finance', email: 'ankit@cqmr.com', phone: '+91 9845003333', role: 'finance', hourlyRate: 550, joiningDate: '2022-09-15', isActive: true, createdAt: '2022-09-15' },
  { id: '4', name: 'Meena Nair', employeeId: 'EMP004', designation: 'Site Engineer', department: 'engineering', email: 'meena@cqmr.com', phone: '+91 9845004444', role: 'maker', hourlyRate: 400, joiningDate: '2024-02-01', isActive: false, createdAt: '2024-02-01' },
];

type StaffForm = Omit<Staff, 'id' | 'createdAt'>;
const BLANK: StaffForm = { name: '', employeeId: '', designation: '', department: 'estimation', email: '', phone: '', role: 'maker', hourlyRate: 0, joiningDate: '', isActive: true };

export function StaffPage() {
  const [items, setItems] = useState<Staff[]>(SEED);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [form, setForm] = useState<StaffForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      i.designation.toLowerCase().includes(search.toLowerCase())
  );

  const set = (field: keyof StaffForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const openCreate = () => { setEditTarget(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (s: Staff) => {
    setEditTarget(s);
    setForm({ name: s.name, employeeId: s.employeeId, designation: s.designation, department: s.department, email: s.email, phone: s.phone, role: s.role, hourlyRate: s.hourlyRate, joiningDate: s.joiningDate, isActive: s.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.employeeId) { toast.error('Name, Employee ID and email required'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      setItems((prev) => prev.map((i) => i.id === editTarget.id ? { ...i, ...form } : i));
      toast.success('Staff member updated');
    } else {
      setItems((prev) => [...prev, { id: String(Date.now()), ...form, createdAt: new Date().toISOString() }]);
      toast.success('Staff member added');
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success('Staff member removed');
    setDeleteTarget(null);
  };

  const roleColor: Record<UserRole, 'primary' | 'success' | 'warning' | 'neutral'> = {
    admin: 'primary', approver: 'warning', finance: 'success', maker: 'neutral',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Staff Master</h2>
          <p className="text-sm text-neutral-500">{items.length} staff members · {items.filter((i) => i.isActive).length} active</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Staff</Button>
      </div>
      <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} className="max-w-xs" />

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <Table
          columns={[
            { key: 'name', header: 'Staff Member', render: (s) => (
              <div>
                <p className="font-medium text-neutral-900">{s.name}</p>
                <p className="text-xs text-neutral-500">{s.employeeId} · {s.designation}</p>
              </div>
            )},
            { key: 'department', header: 'Department', render: (s) => (
              <span className="capitalize">{DEPT_OPTIONS.find((d) => d.value === s.department)?.label ?? s.department}</span>
            )},
            { key: 'role', header: 'System Role', render: (s) => (
              <Badge variant={roleColor[s.role]}>{ROLE_OPTIONS.find((r) => r.value === s.role)?.label}</Badge>
            )},
            { key: 'hourlyRate', header: 'Hourly Rate', render: (s) => `₹${s.hourlyRate}/hr` },
            { key: 'isActive', header: 'Status', render: (s) => <Badge variant={s.isActive ? 'success' : 'neutral'}>{s.isActive ? 'Active' : 'Inactive'}</Badge> },
            { key: 'actions', header: '', render: (s) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={(e) => { e.stopPropagation(); setItems((prev) => prev.map((x) => x.id === s.id ? { ...x, isActive: !x.isActive } : x)); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100">
                  {s.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ), className: 'w-32' },
          ]}
          data={filtered}
          keyExtractor={(s) => s.id}
          emptyState={<EmptyState heading="No staff members" subtext="Add staff to assign to job orders and estimates" ctaLabel="Add Staff" onCta={openCreate} />}
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editTarget ? 'Edit Staff Member' : 'Add Staff Member'} size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={set('name')} />
            <Input label="Employee ID" value={form.employeeId} onChange={set('employeeId')} placeholder="EMP001" />
            <Input label="Designation" value={form.designation} onChange={set('designation')} placeholder="e.g. Senior Estimator" />
            <Select label="Department" value={form.department} onChange={set('department')} options={DEPT_OPTIONS} />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} />
            <Input label="Phone" value={form.phone} onChange={set('phone')} />
            <Select label="System Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))} options={ROLE_OPTIONS} />
            <Input label="Hourly Rate (₹)" type="number" value={form.hourlyRate} onChange={(e) => setForm((p) => ({ ...p, hourlyRate: Number(e.target.value) }))} />
            <Input label="Joining Date" type="date" value={form.joiningDate} onChange={set('joiningDate')} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-4">
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} loading={saving}>{editTarget ? 'Save Changes' : 'Add Staff'}</Button>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Remove Staff Member" consequence={`Remove "${deleteTarget?.name}" from staff master? Their historical data will be preserved.`} confirmLabel="Remove" />
    </div>
  );
}
