import { useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { toast } from '@/components/ui/Toast';

interface CompanyForm {
  name: string;
  logo: File[];
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
}

const INITIAL: CompanyForm = {
  name: 'Acme Construction Pvt Ltd',
  logo: [],
  address: '42, Industrial Area, Phase II',
  city: 'Bengaluru',
  state: 'Karnataka',
  country: 'India',
  pincode: '560058',
  phone: '+91 80 4567 8900',
  email: 'info@acmeconstruction.in',
  website: 'www.acmeconstruction.in',
  gstin: '29AABCA1234F1Z5',
  pan: 'AABCA1234F',
};

export function CompanyPage() {
  const [form, setForm] = useState<CompanyForm>(INITIAL);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof CompanyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Company profile saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Company Profile</h2>
          <p className="text-sm text-neutral-500">Used in PDF headers, invoices, and reports</p>
        </div>
        <Button onClick={handleSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save Changes
        </Button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-6">
        {/* Logo */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Company Logo
          </h3>
          <FileUpload
            accept="image/png,image/jpeg,image/svg+xml"
            onFilesChange={(files) => setForm((p) => ({ ...p, logo: files }))}
            hint="PNG, JPG, SVG — max 2MB. Used in PDF headers."
          />
        </div>

        <div className="border-t border-neutral-100" />

        {/* Basic info */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Company Name" value={form.name} onChange={set('name')} />
            </div>
            <Input label="Phone" value={form.phone} onChange={set('phone')} />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} />
            <Input label="Website" value={form.website} onChange={set('website')} />
          </div>
        </div>

        <div className="border-t border-neutral-100" />

        {/* Address */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Address</h3>
          <div className="space-y-4">
            <Textarea label="Street Address" value={form.address} onChange={set('address')} rows={2} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <Input label="City" value={form.city} onChange={set('city')} />
              </div>
              <Input label="State" value={form.state} onChange={set('state')} />
              <Input label="Pincode" value={form.pincode} onChange={set('pincode')} />
            </div>
            <Input label="Country" value={form.country} onChange={set('country')} />
          </div>
        </div>

        <div className="border-t border-neutral-100" />

        {/* Tax info */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Tax Identifiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="GSTIN" value={form.gstin} onChange={set('gstin')} placeholder="29AABCA1234F1Z5" />
            <Input label="PAN" value={form.pan} onChange={set('pan')} placeholder="AABCA1234F" />
          </div>
        </div>
      </div>
    </div>
  );
}
