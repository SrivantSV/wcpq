import { create } from 'zustand';
import { useJobOrderStore } from './jobOrderStore';
import { useEstimationStore } from './estimationStore';
import { useExecutionStore } from './executionStore';
import { useInvoiceStore } from './invoiceStore';
import type { ExecutionRecord } from '@/types';

export interface KpiData {
  activeJobs: number; onBudgetJobs: number; overBudgetJobs: number;
  totalEstimatedValue: number; totalEstimatedValueLastMonth: number;
  totalActualCost: number; totalEstimatedCostForActuals: number;
  invoicedThisMonth: number; invoicedLastMonth: number;
  outstandingReceivables: number; overdueCount: number;
  completedMTD: number; completedMTDTarget: number;
}
export interface CostTrendPoint { month: string; estimated: number; actual: number; }
export interface PipelineItem { status: string; count: number; label: string; }
export interface OverBudgetJob { jobId: string; jobNumber: string; title: string; variancePct: number; varianceAbs: number; estimated: number; actual: number; }
export interface RevenueByClientItem { client: string; value: number; }
export interface CostSplitItem { month: string; materials: number; labor: number; overhead: number; }
export interface JobSummaryRow { jobId: string; jobNumber: string; title: string; clientName: string; status: string; jobType: string; startDate: string; expectedCompletion: string; estimated: number; actual: number; variance: number; variancePct: number; invoiced: number; invoiceStatus: string; }
export interface ClientProfitabilityRow { clientName: string; jobCount: number; totalEstimated: number; totalActual: number; totalInvoiced: number; margin: number; marginPct: number; }
export interface MaterialConsumptionRow { materialName: string; unit: string; estimated: number; issued: number; variance: number; variancePct: number; }
export interface LaborUtilizationRow { worker: string; role: string; estimatedHours: number; actualHours: number; efficiency: number; }
export interface OverheadAnalysisRow { category: string; estimated: number; actual: number; variance: number; variancePct: number; }
export interface InvoiceAgingRow { invoiceNumber: string; jobNumber: string; client: string; invoiceDate: string; dueDate: string; invoiceTotal: number; amountDue: number; daysOverdue: number; bucket: '0-30' | '31-60' | '61-90' | '90+'; status: string; }

interface ReportsStore {
  getKpis: () => KpiData;
  getCostTrend: () => CostTrendPoint[];
  getPipeline: () => PipelineItem[];
  getTopOverBudget: () => OverBudgetJob[];
  getRevenueByClient: () => RevenueByClientItem[];
  getCostSplit: () => CostSplitItem[];
  getJobSummaryRows: (filters?: { dateFrom?: string; dateTo?: string; clientName?: string; status?: string; jobType?: string }) => JobSummaryRow[];
  getClientProfitability: (filters?: { dateFrom?: string; dateTo?: string; clientName?: string }) => ClientProfitabilityRow[];
  getMaterialConsumption: (filters?: { dateFrom?: string; dateTo?: string }) => MaterialConsumptionRow[];
  getLaborUtilization: (filters?: { dateFrom?: string; dateTo?: string }) => LaborUtilizationRow[];
  getOverheadAnalysis: (filters?: { dateFrom?: string; dateTo?: string }) => OverheadAnalysisRow[];
  getInvoiceAging: (filters?: { clientName?: string; status?: string }) => InvoiceAgingRow[];
}

const ML = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function deriveActualCost(rec: ExecutionRecord): number {
  const mat = rec.materialIssuances.reduce((s, m) => s + m.issuedQty, 0);
  const lab = rec.laborLogs.reduce((s, l) => s + l.loggedHours, 0);
  const ovh = rec.overheadActuals.reduce((s, o) => s + o.actualAmount, 0);
  return mat + lab + ovh;
}

function thisMonth() {
  const n = new Date();
  return { from: new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split('T')[0], to: n.toISOString().split('T')[0] };
}
function lastMonth() {
  const n = new Date();
  return { from: new Date(n.getFullYear(), n.getMonth()-1, 1).toISOString().split('T')[0], to: new Date(n.getFullYear(), n.getMonth(), 0).toISOString().split('T')[0] };
}

export const useReportsStore = create<ReportsStore>(() => ({

  getKpis: () => {
    const jobs = useJobOrderStore.getState().jobs;
    const estimates = useEstimationStore.getState().estimates;
    const records = useExecutionStore.getState().records;
    const invoices = useInvoiceStore.getState().invoices;
    const today = new Date().toISOString().split('T')[0];
    const { from: mFrom, to: mTo } = thisMonth();
    const { from: lmFrom, to: lmTo } = lastMonth();
    const activeJobs = jobs.filter((j) => j.status === 'in_progress' || j.status === 'pending').length;
    let onBudget = 0, overBudget = 0, totalEstimated = 0, totalActual = 0;
    estimates.forEach((est) => {
      const rec = records.find((r) => r.jobOrderId === est.jobOrderId);
      totalEstimated += est.grandTotal;
      const actual = rec ? deriveActualCost(rec) : 0;
      totalActual += actual;
      if (actual > est.grandTotal) overBudget++; else onBudget++;
    });
    const invoicedThisMonth = invoices.filter((i) => i.invoiceDate >= mFrom && i.invoiceDate <= mTo && i.status !== 'voided').reduce((s, i) => s + i.invoiceTotal, 0);
    const invoicedLastMonth = invoices.filter((i) => i.invoiceDate >= lmFrom && i.invoiceDate <= lmTo && i.status !== 'voided').reduce((s, i) => s + i.invoiceTotal, 0);
    const outstandingReceivables = invoices.filter((i) => ['issued','partially_paid','overdue'].includes(i.status)).reduce((s, i) => s + i.amountDue, 0);
    const overdueCount = invoices.filter((i) => i.status === 'overdue' || (i.status === 'issued' && i.dueDate < today)).length;
    const completedMTD = jobs.filter((j) => j.status === 'completed' && (j.expectedCompletion ?? '') >= mFrom && (j.expectedCompletion ?? '') <= mTo).length;
    const estimatedLastMonth = estimates.filter((e) => { const j = jobs.find((jj) => jj.id === e.jobOrderId); return j && j.createdAt >= lmFrom && j.createdAt <= lmTo; }).reduce((s, e) => s + e.grandTotal, 0);
    return { activeJobs, onBudgetJobs: onBudget, overBudgetJobs: overBudget, totalEstimatedValue: totalEstimated, totalEstimatedValueLastMonth: estimatedLastMonth, totalActualCost: totalActual, totalEstimatedCostForActuals: totalEstimated, invoicedThisMonth, invoicedLastMonth, outstandingReceivables, overdueCount, completedMTD, completedMTDTarget: 5 };
  },

  getCostTrend: () => {
    const estimates = useEstimationStore.getState().estimates;
    const records = useExecutionStore.getState().records;
    const now = new Date();
    const totalEst = estimates.reduce((s, e) => s + e.grandTotal, 0);
    const totalAct = records.reduce((s, r) => s + deriveActualCost(r), 0);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const j = 0.7 + (i + 1) * 0.06;
      return { month: ML[d.getMonth()], estimated: Math.round(totalEst * j / 6), actual: Math.round(totalAct * j / 6) };
    });
  },

  getPipeline: () => {
    const jobs = useJobOrderStore.getState().jobs;
    const m: Record<string, { count: number; label: string }> = { pending: { count:0, label:'Pending' }, in_progress: { count:0, label:'In Progress' }, on_hold: { count:0, label:'On Hold' }, completed: { count:0, label:'Completed' }, cancelled: { count:0, label:'Cancelled' } };
    jobs.forEach((j) => { if (m[j.status]) m[j.status].count++; });
    return Object.entries(m).map(([status, { count, label }]) => ({ status, count, label }));
  },

  getTopOverBudget: () => {
    const estimates = useEstimationStore.getState().estimates;
    const records = useExecutionStore.getState().records;
    const jobs = useJobOrderStore.getState().jobs;
    return estimates.map((est) => {
      const rec = records.find((r) => r.jobOrderId === est.jobOrderId);
      const job = jobs.find((j) => j.id === est.jobOrderId);
      const actual = rec ? deriveActualCost(rec) : 0;
      const variance = actual - est.grandTotal;
      return { jobId: est.jobOrderId, jobNumber: job?.jobNumber ?? '', title: job?.title ?? 'Unknown', estimated: est.grandTotal, actual, varianceAbs: variance, variancePct: est.grandTotal > 0 ? (variance / est.grandTotal) * 100 : 0 };
    }).filter((r) => r.variancePct > 0).sort((a, b) => b.variancePct - a.variancePct).slice(0, 5);
  },

  getRevenueByClient: () => {
    const invoices = useInvoiceStore.getState().invoices;
    const map: Record<string, number> = {};
    invoices.filter((i) => i.status !== 'voided').forEach((inv) => { map[inv.billTo] = (map[inv.billTo] ?? 0) + inv.invoiceTotal; });
    return Object.entries(map).map(([client, value]) => ({ client, value })).sort((a, b) => b.value - a.value);
  },

  getCostSplit: () => {
    const records = useExecutionStore.getState().records;
    const now = new Date();
    const totalMat = records.reduce((s, r) => s + r.materialIssuances.reduce((ss, m) => ss + m.issuedQty, 0), 0);
    const totalLab = records.reduce((s, r) => s + r.laborLogs.reduce((ss, l) => ss + l.loggedHours, 0), 0);
    const totalOvh = records.reduce((s, r) => s + r.overheadActuals.reduce((ss, o) => ss + o.actualAmount, 0), 0);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const j = 0.7 + (i + 1) * 0.06;
      return { month: ML[d.getMonth()], materials: Math.round(totalMat * j / 6), labor: Math.round(totalLab * j / 6), overhead: Math.round(totalOvh * j / 6) };
    });
  },

  getJobSummaryRows: (filters = {}) => {
    const jobs = useJobOrderStore.getState().jobs;
    const estimates = useEstimationStore.getState().estimates;
    const records = useExecutionStore.getState().records;
    const invoices = useInvoiceStore.getState().invoices;
    return jobs.filter((j) => {
      if (filters.status && j.status !== filters.status) return false;
      if (filters.clientName && !j.clientName.toLowerCase().includes(filters.clientName.toLowerCase())) return false;
      if (filters.jobType && j.jobType !== filters.jobType) return false;
      if (filters.dateFrom && (j.startDate ?? '') < filters.dateFrom) return false;
      if (filters.dateTo && (j.startDate ?? '') > filters.dateTo) return false;
      return true;
    }).map((j) => {
      const est = estimates.find((e) => e.jobOrderId === j.id);
      const rec = records.find((r) => r.jobOrderId === j.id);
      const inv = invoices.find((i) => i.jobOrderId === j.id);
      const estimated = est?.grandTotal ?? 0;
      const actual = rec ? deriveActualCost(rec) : 0;
      const variance = actual - estimated;
      return { jobId: j.id, jobNumber: j.jobNumber, title: j.title, clientName: j.clientName, status: j.status, jobType: j.jobType, startDate: j.startDate ?? '', expectedCompletion: j.expectedCompletion ?? '', estimated, actual, variance, variancePct: estimated > 0 ? (variance / estimated) * 100 : 0, invoiced: inv?.invoiceTotal ?? 0, invoiceStatus: inv?.status ?? 'none' };
    });
  },

  getClientProfitability: (filters = {}) => {
    const rows = useReportsStore.getState().getJobSummaryRows(filters);
    const map: Record<string, ClientProfitabilityRow> = {};
    rows.forEach((r) => {
      if (!map[r.clientName]) map[r.clientName] = { clientName: r.clientName, jobCount: 0, totalEstimated: 0, totalActual: 0, totalInvoiced: 0, margin: 0, marginPct: 0 };
      const c = map[r.clientName]; c.jobCount++; c.totalEstimated += r.estimated; c.totalActual += r.actual; c.totalInvoiced += r.invoiced;
    });
    return Object.values(map).map((c) => { c.margin = c.totalInvoiced - c.totalActual; c.marginPct = c.totalInvoiced > 0 ? (c.margin / c.totalInvoiced) * 100 : 0; return c; }).sort((a, b) => b.totalInvoiced - a.totalInvoiced);
  },

  getMaterialConsumption: () => {
    const records = useExecutionStore.getState().records;
    const estimates = useEstimationStore.getState().estimates;
    const map: Record<string, { estimated: number; issued: number; unit: string }> = {};
    estimates.forEach((est) => {
      est.materials.forEach((m) => {
        if (!map[m.description]) map[m.description] = { estimated: 0, issued: 0, unit: m.unit };
        map[m.description].estimated += m.estimatedQty;
      });
    });
    records.forEach((rec) => {
      rec.materialIssuances.forEach((issue) => {
        if (!map[issue.description]) map[issue.description] = { estimated: 0, issued: 0, unit: issue.unit };
        map[issue.description].issued += issue.issuedQty;
      });
    });
    return Object.entries(map).map(([materialName, v]) => ({ materialName, unit: v.unit, estimated: v.estimated, issued: v.issued, variance: v.issued - v.estimated, variancePct: v.estimated > 0 ? ((v.issued - v.estimated) / v.estimated) * 100 : 0 })).sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct));
  },

  getLaborUtilization: () => {
    const records = useExecutionStore.getState().records;
    const estimates = useEstimationStore.getState().estimates;
    const wm: Record<string, { estimatedHours: number; actualHours: number; role: string }> = {};
    estimates.forEach((est) => {
      est.labor.forEach((l) => {
        const key = l.workerRole ?? l.taskDescription;
        if (!wm[key]) wm[key] = { estimatedHours: 0, actualHours: 0, role: l.workerRole ?? '' };
        wm[key].estimatedHours += l.estimatedHours;
      });
    });
    records.forEach((rec) => {
      rec.laborLogs.forEach((ll) => {
        if (!wm[ll.worker]) wm[ll.worker] = { estimatedHours: 0, actualHours: 0, role: ll.taskDescription };
        wm[ll.worker].actualHours += ll.loggedHours;
      });
    });
    return Object.entries(wm).map(([worker, v]) => ({ worker, role: v.role, estimatedHours: v.estimatedHours, actualHours: v.actualHours, efficiency: v.actualHours > 0 ? (v.estimatedHours / v.actualHours) * 100 : 100 })).sort((a, b) => a.efficiency - b.efficiency);
  },

  getOverheadAnalysis: () => {
    const records = useExecutionStore.getState().records;
    const estimates = useEstimationStore.getState().estimates;
    const map: Record<string, { estimated: number; actual: number }> = {};
    estimates.forEach((est) => {
      est.overhead.forEach((o) => {
        if (!map[o.description]) map[o.description] = { estimated: 0, actual: 0 };
        map[o.description].estimated += o.calculatedTotal;
      });
    });
    records.forEach((rec) => {
      rec.overheadActuals.forEach((oa) => {
        if (!map[oa.description]) map[oa.description] = { estimated: 0, actual: 0 };
        map[oa.description].actual += oa.actualAmount;
      });
    });
    return Object.entries(map).map(([category, v]) => ({ category, estimated: v.estimated, actual: v.actual, variance: v.actual - v.estimated, variancePct: v.estimated > 0 ? ((v.actual - v.estimated) / v.estimated) * 100 : 0 })).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
  },

  getInvoiceAging: (filters = {}) => {
    const invoices = useInvoiceStore.getState().invoices;
    const today = new Date();
    return invoices.filter((i) => ['issued','partially_paid','overdue'].includes(i.status)).filter((i) => {
      if (filters.clientName && !i.billTo.toLowerCase().includes(filters.clientName.toLowerCase())) return false;
      if (filters.status && i.status !== filters.status) return false;
      return true;
    }).map((i) => {
      const due = new Date(i.dueDate);
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000));
      let bucket: InvoiceAgingRow['bucket'] = '0-30';
      if (daysOverdue > 90) bucket = '90+'; else if (daysOverdue > 60) bucket = '61-90'; else if (daysOverdue > 30) bucket = '31-60';
      return { invoiceNumber: i.invoiceNumber, jobNumber: i.jobNumber, client: i.billTo, invoiceDate: i.invoiceDate, dueDate: i.dueDate, invoiceTotal: i.invoiceTotal, amountDue: i.amountDue, daysOverdue, bucket, status: i.status };
    }).sort((a, b) => b.daysOverdue - a.daysOverdue);
  },
}));
