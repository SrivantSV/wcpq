import { useState } from 'react';
import { Calendar, Download, Mail, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputCls = 'rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors';

export interface DateRange { from: string; to: string; }

const PRESETS: { label: string; getDates: () => DateRange }[] = [
  { label: 'This Week', getDates: () => { const n = new Date(); const mon = new Date(n); mon.setDate(n.getDate() - n.getDay() + 1); return { from: mon.toISOString().split('T')[0], to: n.toISOString().split('T')[0] }; } },
  { label: 'This Month', getDates: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split('T')[0], to: n.toISOString().split('T')[0] }; } },
  { label: 'Last Month', getDates: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth()-1, 1).toISOString().split('T')[0], to: new Date(n.getFullYear(), n.getMonth(), 0).toISOString().split('T')[0] }; } },
  { label: 'This Quarter', getDates: () => { const n = new Date(); const q = Math.floor(n.getMonth() / 3); return { from: new Date(n.getFullYear(), q*3, 1).toISOString().split('T')[0], to: n.toISOString().split('T')[0] }; } },
];

interface Props {
  dateRange: DateRange;
  onDateChange: (r: DateRange) => void;
  extraFilters?: React.ReactNode;
  onExport?: (type: 'pdf' | 'excel') => void;
  rowCount?: number;
}

export function ReportControls({ dateRange, onDateChange, extraFilters, onExport, rowCount }: Props) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleFreq, setScheduleFreq] = useState('monthly');

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date presets */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onDateChange(p.getDates())}
              className={cn('rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                dateRange.from === p.getDates().from
                  ? 'border-[#1B4F9C] bg-[#1B4F9C] text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
          <input type="date" value={dateRange.from} onChange={(e) => onDateChange({ ...dateRange, from: e.target.value })} className={inputCls} />
          <span>–</span>
          <input type="date" value={dateRange.to} onChange={(e) => onDateChange({ ...dateRange, to: e.target.value })} className={inputCls} />
        </div>

        <div className="flex-1" />

        {/* Row count */}
        {rowCount !== undefined && (
          <span className="text-xs text-neutral-400 font-medium">{rowCount} rows</span>
        )}

        {/* Export */}
        {onExport && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => onExport('pdf')} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
            <button onClick={() => onExport('excel')} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
              <Download className="h-3.5 w-3.5" /> Excel
            </button>
          </div>
        )}

        {/* Schedule */}
        <button onClick={() => setShowSchedule((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
          <Mail className="h-3.5 w-3.5" /> Schedule
          <ChevronDown className={cn('h-3 w-3 transition-transform', showSchedule && 'rotate-180')} />
        </button>
      </div>

      {/* Extra filters slot */}
      {extraFilters && <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3">{extraFilters}</div>}

      {/* Schedule panel */}
      {showSchedule && (
        <div className="flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Recipient email</label>
            <input className={inputCls} placeholder="manager@company.com" value={scheduleEmail} onChange={(e) => setScheduleEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Frequency</label>
            <select className={inputCls} value={scheduleFreq} onChange={(e) => setScheduleFreq(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button className="rounded-lg bg-[#1B4F9C] px-3 py-2 text-xs font-semibold text-white hover:bg-[#174287] transition-colors">
            Save Schedule
          </button>
        </div>
      )}
    </div>
  );
}
