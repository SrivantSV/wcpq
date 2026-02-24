import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { Table } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import type { MaterialPriceBook } from '@/types';

const CATEGORY_OPTIONS = [
  { value: 'steel', label: 'Steel & Metal' },
  { value: 'cement', label: 'Cement & Concrete' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'paint', label: 'Paint & Finishing' },
  { value: 'wood', label: 'Wood & Timber' },
  { value: 'glass', label: 'Glass & Glazing' },
  { value: 'tiles', label: 'Tiles & Flooring' },
  { value: 'other', label: 'Other' },
];

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'ton', label: 'Metric Ton' },
  { value: 'bag', label: 'Bag (50kg)' },
  { value: 'sqft', label: 'Square Feet (sqft)' },
  { value: 'sqm', label: 'Square Meter (sqm)' },
  { value: 'rft', label: 'Running Feet (rft)' },
  { value: 'nos', label: 'Numbers (nos)' },
  { value: 'ltr', label: 'Litre (ltr)' },
  { value: 'set', label: 'Set' },
  { value: 'cum', label: 'Cubic Meter (cum)' },
];

const SEED: MaterialPriceBook[] = [
  { id: '1', materialCode: 'STL-001', name: 'TMT Bar 8mm Fe500', description: 'Thermo-Mechanically Treated', category: 'steel', unit: 'kg', unitPrice: 62, currency: 'INR', supplier: 'Raj Steels', lastUpdated: '2025-02-01', isActive: true, createdAt: '2025-01-01' },
  { id: '2', materialCode: 'CEM-001', name: 'OPC Cement 53 Grade', description: 'Ordinary Portland Cement', category: 'cement', unit: 'bag', unitPrice: 380, currency: 'INR', supplier: 'ACC Cement', lastUpdated: '2025-02-01', isActive: true, createdAt: '2025-01-01' },
  { id: '3', materialCode: 'ELE-001', name: 'FRLS Cable 2.5 sqmm', description: 'FR-LS PVC insulated', category: 'electrical', unit: 'rft', unitPrice: 28, currency: 'INR', supplier: 'Apex Electricals', lastUpdated: '2025-02-10', isActive: true, createdAt: '2025-01-01' },
  { id: '4', materialCode: 'PLB-001', name: 'CPVC Pipe 20mm', description: 'Chlorinated PVC pipe', category: 'plumbing', unit: 'rft', unitPrice: 45, currency: 'INR', supplier: 'FastFix Plumbing', lastUpdated: '2025-02-05', isActive: true, createdAt: '2025-01-01' },
  { id: '5', materialCode: 'PAI-001', name: 'Exterior Emulsion Paint', description: 'Weather-proof emulsion', category: 'paint', unit: 'ltr', unitPrice: 240, currency: 'INR', supplier: 'Asian Paints', lastUpdated: '2025-01-20', isActive: true, createdAt: '2025-01-01' },
  { id: '6', materialCode: 'TIL-001', name: 'Vitrified Tile 600x600', description: 'Double charged vitrified', category: 'tiles', unit: 'sqft', unitPrice: 55, currency: 'INR', supplier: 'Kajaria', lastUpdated: '2025-01-15', isActive: false, createdAt: '2025-01-01' },
];

type MatForm = Omit<MaterialPriceBook, 'id' | 'createdAt'>;
const BLANK: MatForm = { materialCode: '', name: '', description: '', category: 'steel', unit: 'kg', unitPrice: 0, currency: 'INR', supplier: '', lastUpdated: new Date().toISOString().split('T')[0], isActive: true };

export function MaterialsPage() {
  const [items, setItems] = useState<MaterialPriceBook[]>(SEED);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MaterialPriceBook | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaterialPriceBook | null>(null);
  const [form, setForm] = useState<MatForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.materialCode.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || i.category === filterCategory;
    return matchSearch && matchCat;
  });

  const set = (field: keyof MatForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const openCreate = () => { setEditTarget(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (m: MaterialPriceBook) => {
    setEditTarget(m);
    setForm({ materialCode: m.materialCode, name: m.name, description: m.description ?? '', category: m.category, unit: m.unit, unitPrice: m.unitPrice, currency: m.currency, supplier: m.supplier ?? '', lastUpdated: m.lastUpdated, isActive: m.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.materialCode || form.unitPrice <= 0) { toast.error('Code, name and price are required'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      setItems((prev) => prev.map((i) => i.id === editTarget.id ? { ...i, ...form } : i));
      toast.success('Material updated');
    } else {
      setItems((prev) => [...prev, { id: String(Date.now()), ...form, createdAt: new Date().toISOString() }]);
      toast.success('Material added to price book');
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success('Material removed from price book');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Material Price Book</h2>
          <p className="text-sm text-neutral-500">{items.length} materials · last updated {new Date().toLocaleDateString('en-IN')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={<Upload className="h-4 w-4" />} onClick={() => toast.info('CSV import coming in Phase 2')}>Import CSV</Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Material</Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} className="max-w-xs" />
        <Select
          placeholder="All categories"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={[{ value: '', label: 'All categories' }, ...CATEGORY_OPTIONS]}
          className="w-48"
        />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <Table
          columns={[
            { key: 'materialCode', header: 'Code', render: (m) => <span className="font-mono text-xs text-neutral-600">{m.materialCode}</span> },
            { key: 'name', header: 'Material', render: (m) => (
              <div>
                <p className="font-medium text-neutral-900">{m.name}</p>
                {m.description && <p className="text-xs text-neutral-500">{m.description}</p>}
              </div>
            )},
            { key: 'category', header: 'Category', render: (m) => (
              <Badge variant="neutral">{CATEGORY_OPTIONS.find((c) => c.value === m.category)?.label ?? m.category}</Badge>
            )},
            { key: 'unitPrice', header: 'Unit Price', render: (m) => (
              <span className="font-semibold">₹{m.unitPrice.toLocaleString('en-IN')} / {m.unit}</span>
            )},
            { key: 'supplier', header: 'Supplier', render: (m) => m.supplier || '—' },
            { key: 'lastUpdated', header: 'Updated', render: (m) => new Date(m.lastUpdated).toLocaleDateString('en-IN') },
            { key: 'isActive', header: 'Status', render: (m) => <Badge variant={m.isActive ? 'success' : 'neutral'}>{m.isActive ? 'Active' : 'Inactive'}</Badge> },
            { key: 'actions', header: '', render: (m) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={(e) => { e.stopPropagation(); openEdit(m); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(m); }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ), className: 'w-20' },
          ]}
          data={filtered}
          keyExtractor={(m) => m.id}
          emptyState={<EmptyState heading="No materials in price book" subtext="Add materials with unit prices for estimate line items" ctaLabel="Add Material" onCta={openCreate} />}
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editTarget ? 'Edit Material' : 'Add Material'} size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Material Code" value={form.materialCode} onChange={set('materialCode')} placeholder="e.g. STL-001" />
            <Select label="Category" value={form.category} onChange={set('category')} options={CATEGORY_OPTIONS} />
            <div className="col-span-2"><Input label="Material Name" value={form.name} onChange={set('name')} placeholder="e.g. TMT Bar 8mm Fe500" /></div>
            <div className="col-span-2"><Input label="Description" value={form.description ?? ''} onChange={set('description')} /></div>
            <Select label="Unit" value={form.unit} onChange={set('unit')} options={UNIT_OPTIONS} />
            <Input label="Unit Price (₹)" type="number" value={form.unitPrice} onChange={(e) => setForm((p) => ({ ...p, unitPrice: Number(e.target.value) }))} />
            <Input label="Supplier" value={form.supplier ?? ''} onChange={set('supplier')} placeholder="Supplier name" />
            <Input label="Price Date" type="date" value={form.lastUpdated} onChange={set('lastUpdated')} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-4">
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} loading={saving}>{editTarget ? 'Save Changes' : 'Add Material'}</Button>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Remove Material" consequence={`Remove "${deleteTarget?.name}" from the price book? Existing estimates retain their values.`} confirmLabel="Remove" />
    </div>
  );
}
