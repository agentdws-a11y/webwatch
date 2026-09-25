import { useState, useEffect } from 'react';
import websiteService from '../services/websiteService';
import maintenanceService from '../services/maintenanceService';
import { useToast } from '../context/ToastContext';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Globe,
  Plus,
  Calendar,
  ShieldCheck,
  Trash2,
  Search,
  Filter,
  User,
} from 'lucide-react';

const DEFAULT_TASKS = [
  'Full Site Backup Completed',
  'Core, Themes & Plugins Updated',
  'Malware & Security Scan Completed',
  'Speed & Performance Optimized',
  'Broken Links Checked & Fixed',
  'Database Tables Cleaned & Optimized',
  'Forms & Checkout Flow Verified',
  'SSL Certificate & HTTPS Checked',
];

function MaintenancePage() {
  const { showToast } = useToast();
  const [websites, setWebsites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [selectedTask, setSelectedTask] = useState(DEFAULT_TASKS[0]);
  const [customTask, setCustomTask] = useState('');
  const [notes, setNotes] = useState('');
  const [performedBy, setPerformedBy] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logs History State
  const [logs, setLogs] = useState([]);
  const [filterSiteId, setFilterSiteId] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchWebsites = async () => {
    try {
      const data = await websiteService.getAll({ is_archived: false, limit: 100 });
      const sites = data.websites || [];
      setWebsites(sites);
      if (sites.length > 0 && !selectedSiteId) {
        setSelectedSiteId(sites[0].id);
      }
    } catch (err) {
      showToast('Failed to load websites.', 'error');
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const params = { limit: 50 };
      if (filterSiteId) params.website_id = filterSiteId;
      const data = await maintenanceService.getLogs(params);
      setLogs(data?.logs || []);
    } catch (err) {
      showToast('Failed to load maintenance logs.', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchWebsites(), fetchLogs()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filterSiteId]);

  const handleLogTask = async (e) => {
    e.preventDefault();
    if (!selectedSiteId) {
      showToast('Please select a website.', 'error');
      return;
    }

    const taskName = customTask.trim() || selectedTask;
    try {
      setIsSubmitting(true);
      await maintenanceService.createLog({
        website_id: selectedSiteId,
        task_name: taskName,
        notes: notes.trim(),
        performed_by: performedBy || 'Admin',
      });
      showToast(`Logged maintenance task: "${taskName}"`);
      setNotes('');
      setCustomTask('');
      fetchLogs();
    } catch (err) {
      showToast('Failed to log maintenance task.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (id, taskName) => {
    if (!window.confirm(`Delete log record for "${taskName}"?`)) return;
    try {
      await maintenanceService.deleteLog(id);
      showToast('Maintenance log deleted.');
      fetchLogs();
    } catch (err) {
      showToast('Failed to delete maintenance log.', 'error');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Checklist &amp; Logs</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Execute recurring maintenance routines per client site and track timestamped historical maintenance logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Form */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-bold border-b border-slate-100 pb-3">
            <ClipboardCheck size={18} />
            <span>Record Maintenance Task</span>
          </div>

          <form onSubmit={handleLogTask} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Website</label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="select"
                required
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.website_name} ({w.technology})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Routine Checklist Item</label>
              <select
                value={selectedTask}
                onChange={(e) => {
                  setSelectedTask(e.target.value);
                  setCustomTask('');
                }}
                className="select"
              >
                {DEFAULT_TASKS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Or Custom Task Name</label>
              <input
                type="text"
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                placeholder="e.g. Upgrade to PHP 8.3 & Optimize MySQL"
                className="input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Performed By</label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder="Admin"
                className="input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Notes / Findings</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Document plugin update details, backup sizes, or performance improvements..."
                className="input"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 font-semibold text-xs shadow-sm"
            >
              {isSubmitting ? 'Recording Timestamp...' : 'Submit & Timestamp Log'}
            </button>
          </form>
        </div>

        {/* Quick Checklist Matrix */}
        <div className="lg:col-span-2 card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Standard Maintenance Checklist</h2>
              <p className="text-xs text-slate-500">Core operational verification items</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
              8 Standard Tasks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEFAULT_TASKS.map((task, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-800">{task}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTask(task);
                    setCustomTask('');
                  }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                >
                  Select
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-4 rounded-b-2xl text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={16} className="text-emerald-600" />
              Regular maintenance improves page speed, search rankings, and security defenses.
            </span>
          </div>
        </div>
      </div>

      {/* Maintenance History Table */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Maintenance Activity History</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {logs.length} Total
            </span>
          </div>

          {/* Filter by Site */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filterSiteId}
              onChange={(e) => setFilterSiteId(e.target.value)}
              className="select text-xs py-1.5 px-3 min-w-[200px]"
            >
              <option value="">All Websites</option>
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.website_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {logsLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No maintenance logs recorded yet. Use the form above to record your first task.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Website</th>
                  <th className="py-3 px-4">Task Performed</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Work Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.website_name}</div>
                      <div className="text-[11px] text-slate-400">{log.technology}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-700 flex items-center gap-1.5 mt-1">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      {log.task_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                      {formatDate(log.performed_at)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[11px]">
                        {log.performed_by || 'Admin'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {log.notes || <span className="text-slate-400 italic">No notes</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id, log.task_name)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete log record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaintenancePage;
