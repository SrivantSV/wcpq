import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import type { User } from '@/types';

const DEMO_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@cqmr.com',
    password: 'admin123',
    user: { id: '1', name: 'Admin User', email: 'admin@cqmr.com', role: 'admin', isActive: true, createdAt: new Date().toISOString() },
  },
  {
    email: 'maker@cqmr.com',
    password: 'maker123',
    user: { id: '2', name: 'Raj Estimator', email: 'maker@cqmr.com', role: 'maker', isActive: true, createdAt: new Date().toISOString() },
  },
  {
    email: 'approver@cqmr.com',
    password: 'approver123',
    user: { id: '3', name: 'Priya Approver', email: 'approver@cqmr.com', role: 'approver', isActive: true, createdAt: new Date().toISOString() },
  },
  {
    email: 'finance@cqmr.com',
    password: 'finance123',
    user: { id: '4', name: 'Ankit Finance', email: 'finance@cqmr.com', role: 'finance', isActive: true, createdAt: new Date().toISOString() },
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const match = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (match) {
      login(match.user, `demo-token-${match.user.id}`);
      toast.success(`Welcome back, ${match.user.name}!`);
      navigate('/dashboard');
    } else {
      toast.error('Invalid email or password');
      setErrors({ password: 'Invalid credentials' });
    }
    setLoading(false);
  };

  const loginAs = (demoUser: (typeof DEMO_USERS)[0]) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4F9C] via-[#2E75B6] to-[#1B4F9C] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo card */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg mb-3">
            <Building2 className="h-8 w-8 text-[#1B4F9C]" />
          </div>
          <h1 className="text-2xl font-bold text-white">CQMR</h1>
          <p className="text-sm text-white/70">Cost & Quote Management</p>
        </div>

        {/* Login form */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Sign in</h2>
          <p className="text-sm text-neutral-500 mb-6">Enter your credentials to access the platform</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              onBlur={() => validate()}
              error={errors.email}
              placeholder="you@company.com"
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              onBlur={() => validate()}
              error={errors.password}
              placeholder="••••••••"
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-neutral-400 hover:text-neutral-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Button type="submit" className="w-full" loading={loading} size="lg">
              Sign in
            </Button>
          </form>

          {/* Demo logins */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <p className="text-xs font-medium text-neutral-500 mb-3 text-center">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => loginAs(u)}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-left hover:bg-neutral-50 transition-colors"
                >
                  <p className="text-xs font-medium text-neutral-700 capitalize">{u.user.role}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{u.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
