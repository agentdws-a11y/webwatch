import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import websiteService from '../services/websiteService';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  ExternalLink,
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
  Globe,
  Server,
  Shield,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  KeyRound,
  Tag,
  Plus,
} from 'lucide-react';
import StatusBadge from '../components/websites/StatusBadge';
import WebsiteForm from '../components/websites/WebsiteForm';

function WebsiteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'maintenance'

  const fetchWebsite = async () => {
    try {
      setLoading(true);
      const data = await websiteService.getById(id);
      setWebsite(data);
    } catch (err) {
      showToast('Website not found.', 'error');
      navigate('/websites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsite();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      await websiteService.update(id, formData);
      showToast('Website updated successfully!');
      setIsEditing(false);
      fetchWebsite();
    } catch (err) {
      showToast('Failed to update website.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm(`Archive "${website.website_name}"?`)) return;
    try {
      await websiteService.archive(id);
      showToast('Website archived.');
      navigate('/websites');
    } catch (err) {
      showToast('Failed to archive website.', 'error');
    }
  };

  const handleRestore = async () => {
    try {
      await websiteService.restore(id);
      showToast('Website restored to active list.');
      fetchWebsite();
    } catch (err) {
      showToast('Failed to restore website.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete "${website.website_name}"? This cannot be undone.`)) return;
    try {
      await websiteService.delete(id);
      showToast('Website permanently deleted.');
      navigate('/websites');
    } catch (err) {
      showToast('Failed to delete website.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!website) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/websites"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Websites
        </Link>

        {website.is_archived && (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Archive size={14} /> Archived Website
          </span>
        )}
      </div>

      {/* Website Hero Card */}
      <div className="card bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-0 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{website.website_name}</h1>
              <StatusBadge status={website.health.overallStatus} />
            </div>
            <a
              href={website.website_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1"
            >
              {website.website_url} <ExternalLink size={12} />
            </a>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary text-xs py-2 px-3 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Edit2 size={14} /> {isEditing ? 'Cancel Edit' : 'Edit Website'}
            </button>

            {website.is_archived ? (
              <button
                onClick={handleRestore}
                className="btn btn-secondary text-xs py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30"
              >
                <RotateCcw size={14} /> Restore
              </button>
            ) : (
              <button
                onClick={handleArchive}
                className="btn btn-secondary text-xs py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30"
              >
                <Archive size={14} /> Archive
              </button>
            )}

            <button
              onClick={handleDelete}
              className="btn btn-danger text-xs py-2 px-3 bg-rose-600/80 hover:bg-rose-600"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Hero Quick Meta Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Client</span>
            <span className="font-semibold text-slate-100">{website.client?.name || 'No Client Assigned'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Technology</span>
            <span className="font-semibold text-slate-100">{website.technology}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Support Plan</span>
            <span className="font-semibold text-slate-100">{website.support_plan}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Priority</span>
            <span className="font-semibold text-slate-100">{website.priority}</span>
          </div>
        </div>
      </div>

      {/* Editing State or View State */}
      {isEditing ? (
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Edit Website Details</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
            >
              Cancel
            </button>
          </div>
          <WebsiteForm
            initialData={website}
            onSubmit={handleUpdate}
            isSubmitting={isSubmitting}
            submitLabel="Update Website"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 5 Expiry Tracking Cards */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3">5-Point Renewal Tracking</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Domain Tracking */}
              <div className="card border-l-4 border-l-indigo-500 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Globe size={16} className="text-indigo-600" /> Domain Renewal
                    </span>
                    <StatusBadge status={website.domain?.status} />
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-600 mt-3">
                    <p>
                      <strong className="text-slate-800">Registrar:</strong> {website.domain?.registrar || 'Not Specified'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Expiry Date:</strong> {website.domain?.date || 'Not Set'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Days Remaining:</strong>{' '}
                      <span className="font-bold text-slate-900">{website.domain?.daysRemaining ?? 'N/A'} days</span>
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                  <span>Cost: ${website.domain?.cost || 0} / yr</span>
                  <span>{website.domain?.auto_renew ? 'Auto-Renew: ON' : 'Auto-Renew: OFF'}</span>
                </div>
              </div>

              {/* 2. Hosting Tracking */}
              <div className="card border-l-4 border-l-blue-500 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Server size={16} className="text-blue-600" /> Hosting Renewal
                    </span>
                    <StatusBadge status={website.hosting?.status} />
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-600 mt-3">
                    <p>
                      <strong className="text-slate-800">Provider:</strong> {website.hosting?.provider || 'Not Specified'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Plan:</strong> {website.hosting?.plan_name || 'Standard'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Renewal Date:</strong> {website.hosting?.date || 'Not Set'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Days Remaining:</strong>{' '}
                      <span className="font-bold text-slate-900">{website.hosting?.daysRemaining ?? 'N/A'} days</span>
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                  <span>Cost: ${website.hosting?.cost || 0} / yr</span>
                  <span>{website.hosting?.auto_renew ? 'Auto-Renew: ON' : 'Auto-Renew: OFF'}</span>
                </div>
              </div>

              {/* 3. SSL Certificate Tracking */}
              <div className="card border-l-4 border-l-emerald-500 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Shield size={16} className="text-emerald-600" /> SSL Certificate
                    </span>
                    <StatusBadge status={website.ssl?.status} />
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-600 mt-3">
                    <p>
                      <strong className="text-slate-800">Issuer:</strong> {website.ssl?.issuer || "Let's Encrypt / Auto"}
                    </p>
                    <p>
                      <strong className="text-slate-800">Expiry Date:</strong> {website.ssl?.date || 'Not Set'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Days Remaining:</strong>{' '}
                      <span className="font-bold text-slate-900">{website.ssl?.daysRemaining ?? 'N/A'} days</span>
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                  <span>Type: {website.ssl?.ssl_type || 'Standard'}</span>
                  <span>{website.ssl?.auto_renew ? 'Auto-Renew: ON' : 'Auto-Renew: OFF'}</span>
                </div>
              </div>

              {/* 4. Business Email Tracking */}
              <div className="card border-l-4 border-l-purple-500 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Mail size={16} className="text-purple-600" /> Business Email
                    </span>
                    <StatusBadge status={website.email_cdn?.email_status?.status} />
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-600 mt-3">
                    <p>
                      <strong className="text-slate-800">Provider:</strong>{' '}
                      {website.email_cdn?.email_provider || 'Not Configured'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Expiry Date:</strong>{' '}
                      {website.email_cdn?.email_status?.date || 'N/A'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Days Remaining:</strong>{' '}
                      <span className="font-bold text-slate-900">
                        {website.email_cdn?.email_status?.daysRemaining ?? 'N/A'} days
                      </span>
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Business Email Subscriptions
                </div>
              </div>

              {/* 5. CDN Tracking */}
              <div className="card border-l-4 border-l-orange-500 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Globe size={16} className="text-orange-600" /> CDN &amp; WAF
                    </span>
                    <StatusBadge status={website.email_cdn?.cdn_status?.status} />
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-600 mt-3">
                    <p>
                      <strong className="text-slate-800">Provider:</strong>{' '}
                      {website.email_cdn?.cdn_provider || 'Not Configured'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Expiry Date:</strong>{' '}
                      {website.email_cdn?.cdn_status?.date || 'N/A'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Days Remaining:</strong>{' '}
                      <span className="font-bold text-slate-900">
                        {website.email_cdn?.cdn_status?.daysRemaining ?? 'N/A'} days
                      </span>
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  CDN &amp; Edge Network
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance History & Tags */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Maintenance History */}
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Recent Maintenance History</h3>
                <Link to="/maintenance" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Open Checklist Drawer &rarr;
                </Link>
              </div>

              {website.recent_maintenance_logs?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No maintenance logs recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {website.recent_maintenance_logs?.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          <span>{log.task_name}</span>
                        </div>
                        {log.notes && <p className="text-slate-600 mt-1 pl-6">{log.notes}</p>}
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap pl-4">
                        {new Date(log.performed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags & Metadata */}
            <div className="card space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Site Attributes</h3>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">Project Tags</span>
                {website.tags?.length === 0 ? (
                  <span className="text-xs text-slate-400">No tags assigned</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {website.tags?.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {website.notes && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Developer Notes</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {website.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteDetailsPage;