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
import type { User, UserRole } from '@/types';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'approver', label: 'Approver' },
  { value: 'finance', label: 'Finance' },
  { value: 'maker', label: 'Maker / Estimator' },
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@cqmr.com', role: 'admin', isActive: true, createdAt: '2025-01-01' },
  { id: '2', name: 'Raj Kumar', email: 'maker@cqmr.com', role: 'maker', isActive: true, createdAt: '2025-01-05' },
  { id: '3', name: 'Priya Sharma', email: 'approver@cqmr.com', role: 'approver', isActive: true, createdAt: '2025-01-10' },
  { id: '4', name: 'Ankit Verma', email: 'finance@cqmr.com', role: 'finance', isActive: true, createdAt: '2025-01-12' },
  { id: '5', name: 'Meena Nair', email: 'meena@cqmr.com', role: 'maker', isActive: false, createdAt: '2025-01-20' },
];

interface UserForm {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

const BLANK: UserForm = { name: '', email: '', role: 'maker', password: '' };

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditTarget(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (u: User) => { setEditTarget(u); setForm({ name: u.name, email: u.email, role: u.role, password: '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      setUsers((prev) => prev.map((u) => u.id === editTarget.id ? { ...u, ...form } : u));
      toast.success('User updated successfully');
    } else {
      const newUser: User = { id: String(Date.now()), ...form, isActive: true, createdAt: new Date().toISOString() };
      setUsers((prev) => [...prev, newUser]);
      toast.success('User created successfully');
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await new Promise((r) => setTimeout(r, 400));
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    toast.success('User deleted');
    setDeleteTarget(null);
  };

  const toggleStatus = (u: User) => {
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, isActive: !x.isActive } : x));
    toast.info(`${u.name} ${u.isActive ? 'deactivated' : 'activated'}`);
  };

  const roleVariant: Record<UserRole, 'primary' | 'warning' | 'success' | 'neutral'> = {
    admin: 'danger' as never,
    approver: 'primary',
    finance: 'success',
    maker: 'warning',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Users & Roles</h2>
          <p className="text-sm text-neutral-500">{users.length} users · {users.filter((u) => u.isActive).length} active</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add User</Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-xs"
        />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <Table
          columns={[
            { key: 'name', header: 'Name', render: (u) => (
              <div>
                <p className="font-medium text-neutral-900">{u.name}</p>
                <p className="text-xs text-neutral-500">{u.email}</p>
              </div>
            )},
            { key: 'role', header: 'Role', render: (u) => (
              <Badge variant={roleVariant[u.role]}>{ROLE_OPTIONS.find((r) => r.value === u.role)?.label}</Badge>
            )},
            { key: 'isActive', header: 'Status', render: (u) => (
              <Badge variant={u.isActive ? 'success' : 'neutral'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
            )},
            { key: 'createdAt', header: 'Joined', render: (u) => new Date(u.createdAt).toLocaleDateString('en-IN') },
            { key: 'actions', header: '', render: (u) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={(e) => { e.stopPropagation(); toggleStatus(u); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700" title={u.isActive ? 'Deactivate' : 'Activate'}>
                  {u.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); openEdit(u); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-blue-600">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ), className: 'w-32'},
          ]}
          data={filtered}
          keyExtractor={(u) => u.id}
          emptyState={<EmptyState heading="No users found" subtext="Add your first user to get started" ctaLabel="Add User" onCta={openCreate} />}
        />
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editTarget ? 'Edit User' : 'Add User'} size="sm">
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@company.com" />
          <Select label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))} options={ROLE_OPTIONS} />
          {!editTarget && (
            <Input label="Temporary Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} loading={saving}>{editTarget ? 'Save Changes' : 'Create User'}</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        consequence={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete User"
      />
    </div>
  );
}
