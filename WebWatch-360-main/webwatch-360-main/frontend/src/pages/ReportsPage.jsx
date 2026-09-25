import { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import maintenanceService from '../services/maintenanceService';
import { useToast } from '../context/ToastContext';
import {
  FileBarChart,
  Download,
  FileText,
  Calendar,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  DollarSign,
  Printer,
} from 'lucide-react';

function ReportsPage() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await reportService.getSummary();
      setSummary(data);
    } catch (err) {
      showToast('Failed to load report summary.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const exportWebsitesCSV = () => {
    const websites = summary?.websites || [];
    if (websites.length === 0) {
      showToast('No websites to export.', 'error');
      return;
    }

    const headers = [
      'Website Name',
      'URL',
      'Client',
      'Technology',
      'Support Plan',
      'Priority',
      'Domain Registrar',
      'Domain Expiry Date',
      'Domain Days Left',
      'Hosting Provider',
      'Hosting Renewal Date',
      'Hosting Cost ($)',
      'SSL Issuer',
      'SSL Expiry Date',
      'Email Provider',
      'CDN Provider',
      'Overall Health Status',
    ];

    const rows = websites.map((w) => [
      `"${w.website_name || ''}"`,
      `"${w.website_url || ''}"`,
      `"${w.client?.name || 'N/A'}"`,
      `"${w.technology || ''}"`,
      `"${w.support_plan || ''}"`,
      `"${w.priority || ''}"`,
      `"${w.domain?.registrar || ''}"`,
      `"${w.domain?.date || ''}"`,
      `"${w.domain?.daysRemaining ?? ''}"`,
      `"${w.hosting?.provider || ''}"`,
      `"${w.hosting?.date || ''}"`,
      `"${w.hosting?.cost || 0}"`,
      `"${w.ssl?.issuer || ''}"`,
      `"${w.ssl?.date || ''}"`,
      `"${w.email_cdn?.email_provider || ''}"`,
      `"${w.email_cdn?.cdn_provider || ''}"`,
      `"${w.health?.overallStatus?.toUpperCase() || 'SAFE'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WebWatch360_Website_Portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Website portfolio CSV exported!');
  };

  const exportMaintenanceCSV = async () => {
    try {
      const data = await maintenanceService.getLogs({ limit: 1000 });
      const logs = data?.logs || [];
      if (logs.length === 0) {
        showToast('No maintenance logs to export.', 'error');
        return;
      }

      const headers = ['Website', 'Technology', 'Client', 'Task Name', 'Performed By', 'Timestamp', 'Notes'];
      const rows = logs.map((l) => [
        `"${l.website_name || ''}"`,
        `"${l.technology || ''}"`,
        `"${l.client_name || 'N/A'}"`,
        `"${l.task_name || ''}"`,
        `"${l.performed_by || 'Admin'}"`,
        `"${l.performed_at || ''}"`,
        `"${(l.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `WebWatch360_Maintenance_Logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Maintenance logs CSV exported!');
    } catch (err) {
      showToast('Failed to export maintenance logs.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { totalSites = 0, safeCount = 0, warningCount = 0, expiredCount = 0, estimatedMonthlyCost = 0, maintenanceThisMonth = {} } = summary || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports &amp; Data Export</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit portfolio health, track maintenance activity, and export detailed spreadsheets.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="btn btn-secondary text-xs py-2 px-3 self-start sm:self-auto"
        >
          <Printer size={14} /> Print Summary
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Portfolio</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalSites} Sites</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" /> {safeCount} Safe
          </div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold text-amber-500 uppercase">Expiring Soon</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{warningCount} Sites</div>
          <div className="text-xs text-slate-500 mt-1">Due within 30 days</div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold text-rose-500 uppercase">Expired Services</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{expiredCount} Sites</div>
          <div className="text-xs text-slate-500 mt-1">Immediate action needed</div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold text-indigo-500 uppercase">Maintenance Logs</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {maintenanceThisMonth.totalLogs || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Logged this month</div>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Website Portfolio Export */}
        <div className="card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
              <FileBarChart size={20} />
              <h3 className="text-base font-bold text-slate-900">Website Renewal Portfolio (CSV)</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export full spreadsheet containing website URLs, clients, technologies, domain expiries, hosting renewal dates, and SSL validity.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{totalSites} Websites Ready</span>
            <button onClick={exportWebsitesCSV} className="btn btn-primary text-xs py-2 px-4 shadow-sm">
              <Download size={14} /> Download Portfolio CSV
            </button>
          </div>
        </div>

        {/* Maintenance Logs Export */}
        <div className="card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
              <Calendar size={20} />
              <h3 className="text-base font-bold text-slate-900">Maintenance Activity Logs (CSV)</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete historical spreadsheet of all timestamped backups, updates, security scans, and developer notes recorded across client sites.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-medium">Ready for Client Audits</span>
            <button onClick={exportMaintenanceCSV} className="btn btn-secondary text-xs py-2 px-4">
              <Download size={14} /> Download Maintenance CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
