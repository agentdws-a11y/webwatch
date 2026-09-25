import { useState, useEffect } from 'react';
import websiteService from '../services/websiteService';
import { useToast } from '../context/ToastContext';
import { FileBarChart, Download, FileText, Calendar, CheckCircle } from 'lucide-react';

function ReportsPage() {
  const { showToast } = useToast();
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    websiteService.getAll({ limit: 500 }).then((data) => setWebsites(data.websites || [])).catch(() => {});
  }, []);

  const exportCSV = () => {
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
      'Domain Expiry',
      'Domain Days Left',
      'Hosting Renewal',
      'Hosting Cost',
      'SSL Expiry',
      'Overall Health',
    ];

    const rows = websites.map((w) => [
      `"${w.website_name}"`,
      `"${w.website_url}"`,
      `"${w.client?.name || 'N/A'}"`,
      `"${w.technology}"`,
      `"${w.support_plan}"`,
      `"${w.domain?.date || ''}"`,
      `"${w.domain?.daysRemaining ?? ''}"`,
      `"${w.hosting?.date || ''}"`,
      `"${w.hosting?.cost || 0}"`,
      `"${w.ssl?.date || ''}"`,
      `"${w.health?.overallStatus?.toUpperCase() || 'SAFE'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WebWatch360_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report CSV downloaded successfully!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports &amp; Data Export</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Generate portfolio audit reports and export complete renewal status schedules to CSV.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
              <FileBarChart size={20} />
              <h3 className="text-base font-bold text-slate-900">Website Renewal Portfolio (CSV)</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export full spreadsheet containing website URLs, clients, technologies, domain expiries, hosting costs, and SSL validity.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{websites.length} Websites Ready</span>
            <button onClick={exportCSV} className="btn btn-primary text-xs py-2 px-4 shadow-sm">
              <Download size={14} /> Download CSV Export
            </button>
          </div>
        </div>

        <div className="card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
              <Calendar size={20} />
              <h3 className="text-base font-bold text-slate-900">Monthly Client Maintenance Summary</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Summary report of maintenance logs, backups, and security scans completed during the current billing period.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-medium">Ready for Client Review</span>
            <button onClick={exportCSV} className="btn btn-secondary text-xs py-2 px-4">
              <FileText size={14} /> Generate Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
