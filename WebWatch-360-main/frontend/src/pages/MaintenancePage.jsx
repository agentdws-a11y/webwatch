import { useState, useEffect } from 'react';
import websiteService from '../services/websiteService';
import { useToast } from '../context/ToastContext';
import { ClipboardCheck, CheckCircle2, Clock, Globe, Plus, Calendar, ShieldCheck } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    websiteService.getAll({ limit: 100 })
      .then((data) => {
        const sites = data.websites || [];
        setWebsites(sites);
        if (sites.length > 0) setSelectedSiteId(sites[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogTask = async (e) => {
    e.preventDefault();
    if (!selectedSiteId) {
      showToast('Please select a website.', 'error');
      return;
    }

    const taskName = customTask.trim() || selectedTask;
    try {
      setIsSubmitting(true);
      // Mock / direct toast for checklist log
      await new Promise((r) => setTimeout(r, 400));
      showToast(`Logged maintenance task: "${taskName}"`);
      setNotes('');
      setCustomTask('');
    } catch (err) {
      showToast('Failed to log maintenance task.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Checklist &amp; Logs</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Complete recurring maintenance checks per website and maintain a timestamped log history.
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
              <label className="block font-semibold text-slate-700 mb-1">Maintenance Routine Task</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
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
                placeholder="e.g. PHP 8.3 Upgrade"
                className="input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Notes / Findings</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Notes about plugin updates, database sizes, or optimizations..."
                className="input"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 font-semibold text-xs"
            >
              {isSubmitting ? 'Saving Log...' : 'Submit & Timestamp Log'}
            </button>
          </form>
        </div>

        {/* Quick Checklists Overview */}
        <div className="lg:col-span-2 card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Standard Recurring Checklist</h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">
              8 Standard Tasks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEFAULT_TASKS.map((task, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs"
              >
                <CheckCircle2 size={16} className="text-indigo-600 flex-shrink-0" />
                <span className="font-semibold text-slate-800">{task}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/60 -mx-5 -mb-5 p-4 rounded-b-xl text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={16} className="text-emerald-600" />
              Regular maintenance improves SEO rank and prevents security breaches.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenancePage;
