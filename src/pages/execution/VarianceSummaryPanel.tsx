import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import type { Estimate } from '@/types';

interface Props {
  estimate: Estimate;
  matActual: number;
  labActual: number;
  ovhActual: number;
}

interface VarianceRow {
  label: string;
  estimated: number;
  actual: number;
}

function VarianceStatus({ variance, estimated }: { variance: number; estimated: number }) {
  const pct = estimated > 0 ? (variance / estimated) * 100 : 0;
  if (variance > 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: `+${pct.toFixed(1)}% Over` };
  if (pct <= -90) return { color: 'text-neutral-500', bg: 'bg-neutral-50', border: 'border-neutral-200', label: `${pct.toFixed(1)}%` };
  if (Math.abs(pct) >= 0 && variance < 0 && Math.abs(pct) > 90) return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: `${pct.toFixed(1)}% Near limit` };
  return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: `${pct.toFixed(1)}% Under` };
}

function getVarianceCls(variance: number, estimated: number): string {
  const pct = estimated > 0 ? (variance / estimated) * 100 : 0;
  if (variance > 0) return 'text-red-600 font-bold';
  if (pct >= -10) return 'text-amber-600 font-semibold';
  return 'text-emerald-600 font-semibold';
}

function getRowBg(variance: number, estimated: number): string {
  const pct = estimated > 0 ? (variance / estimated) * 100 : 0;
  if (variance > 0) return 'bg-red-50/50';
  if (pct >= -10) return 'bg-amber-50/40';
  return '';
}

export function VarianceSummaryPanel({ estimate, matActual, labActual, ovhActual }: Props) {
  const rows: VarianceRow[] = [
    { label: 'Direct Materials', estimated: estimate.materialsTotal, actual: matActual },
    { label: 'Direct Labor', estimated: estimate.laborTotal, actual: labActual },
    { label: 'Overhead', estimated: estimate.overheadTotal, actual: ovhActual },
  ];
  const totalEstimated = estimate.subTotal;
  const totalActual = matActual + labActual + ovhActual;
  const totalVariance = totalActual - totalEstimated;

  const overallStatus = VarianceStatus({ variance: totalVariance, estimated: totalEstimated });

  return (
    <div className="p-4 space-y-4">
      {/* Overall status chip */}
      <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold', overallStatus.bg, overallStatus.border, overallStatus.color)}>
        <span className={cn('h-1.5 w-1.5 rounded-full', totalVariance > 0 ? 'bg-red-500' : Math.abs(totalVariance / totalEstimated) <= 0.10 ? 'bg-amber-500' : 'bg-emerald-500')} />
        Overall: {overallStatus.label}
      </div>

      {/* Variance table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full min-w-[500px]">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {['Section', 'Estimated', 'Actual to Date', 'Variance', 'Variance %'].map((h, i) => (
                <th key={i} className={cn('px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide', i === 0 ? 'text-left' : 'text-right')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => {
              const variance = row.actual - row.estimated;
              const pct = row.estimated > 0 ? (variance / row.estimated) * 100 : 0;
              return (
                <tr key={row.label} className={cn('transition-colors', getRowBg(variance, row.estimated))}>
                  <td className="px-4 py-3.5 text-sm font-medium text-neutral-800">{row.label}</td>
                  <td className="px-4 py-3.5 text-sm text-right text-neutral-700 tabular-nums">{formatCurrency(row.estimated)}</td>
                  <td className="px-4 py-3.5 text-sm text-right font-semibold text-neutral-900 tabular-nums">{formatCurrency(row.actual)}</td>
                  <td className={cn('px-4 py-3.5 text-sm text-right tabular-nums', getVarianceCls(variance, row.estimated))}>
                    {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                  </td>
                  <td className={cn('px-4 py-3.5 text-sm text-right tabular-nums', getVarianceCls(variance, row.estimated))}>
                    {variance > 0 ? '+' : ''}{pct.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-neutral-50 border-t-2 border-neutral-300">
            <tr>
              <td className="px-4 py-3.5 text-sm font-bold text-neutral-900">TOTAL</td>
              <td className="px-4 py-3.5 text-sm text-right font-bold text-neutral-900 tabular-nums">{formatCurrency(totalEstimated)}</td>
              <td className="px-4 py-3.5 text-sm text-right font-bold text-neutral-900 tabular-nums">{formatCurrency(totalActual)}</td>
              <td className={cn('px-4 py-3.5 text-sm text-right font-bold tabular-nums', getVarianceCls(totalVariance, totalEstimated))}>
                {totalVariance > 0 ? '+' : ''}{formatCurrency(totalVariance)}
              </td>
              <td className={cn('px-4 py-3.5 text-sm text-right font-bold tabular-nums', getVarianceCls(totalVariance, totalEstimated))}>
                {totalVariance > 0 ? '+' : ''}{totalEstimated > 0 ? ((totalVariance / totalEstimated) * 100).toFixed(2) : '0.00'}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-100 border border-emerald-300" /> Under budget</div>
        <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-100 border border-amber-300" /> Within 10% of limit</div>
        <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-100 border border-red-300" /> Over estimate</div>
      </div>
    </div>
  );
}
