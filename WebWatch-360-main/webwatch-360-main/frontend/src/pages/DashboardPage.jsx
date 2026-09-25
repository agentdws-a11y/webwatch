import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import websiteService from '../services/websiteService';
import {
  Globe,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CalendarCheck,
  Users,
  Plus,
  ArrowRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from '../components/websites/StatusBadge';

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentWebsites, setRecentWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [sumData, sitesData] = await Promise.all([
        dashboardService.getSummary(),
        websiteService.getAll({ limit: 6, sort_by: 'created_at', sort_order: 'DESC' }),
      ]);
      setSummary(sumData);
      setRecentWebsites(sitesData.websites || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Fetching portfolio metrics...</p>
        </div>
      </div>
    );
  }

  const { overview = {}, technologyDistribution = {}, criticalAlerts = {} } = summary || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status of all client websites, domains, hosting, SSL certificates & renewals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="btn btn-secondary text-xs py-2 px-3"
            title="Refresh Metrics"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/websites/add" className="btn btn-primary text-xs py-2 px-4 shadow-sm">
            <Plus size={16} /> Add Website
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Websites */}
        <div className="card card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Websites</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview.totalWebsites || 0}</h3>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-medium text-slate-700">{overview.totalArchived || 0}</span> archived in vault
            </p>
          </div>
        </div>

        {/* Safe Websites */}
        <div className="card card-hover flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">🟢 Safe Services</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview.safeCount || 0}</h3>
            <p className="text-xs text-emerald-600 mt-1">&gt; 30 days remaining</p>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="card card-hover flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">🟡 Expiring Soon</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview.warningCount || 0}</h3>
            <p className="text-xs text-amber-600 mt-1">≤ 30 days deadline</p>
          </div>
        </div>

        {/* Expired Services */}
        <div className="card card-hover flex items-center gap-4 border-l-4 border-l-rose-500">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertOctagon size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">🔴 Expired Overdue</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-0.5">{overview.expiredCount || 0}</h3>
            <p className="text-xs text-rose-500 mt-1">Immediate action needed</p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Critical Action Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Alerts / Needs Attention */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} />
              <h2 className="text-base font-semibold text-slate-900">Immediate Action &amp; Upcoming Renewals</h2>
            </div>
            <Link to="/websites?status=warning" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              View All Expiring &rarr;
            </Link>
          </div>

          {criticalAlerts.expired?.length === 0 && criticalAlerts.expiringSoon?.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheck className="mx-auto text-emerald-500 mb-2" size={32} />
              <p className="text-sm font-medium text-slate-800">All services are currently healthy!</p>
              <p className="text-xs text-slate-500">No expired domains, hosting or SSL certificates found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Expired Items */}
              {criticalAlerts.expired?.map((site) => (
                <div
                  key={`exp-${site.id}`}
                  className="flex items-center justify-between p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                      🔴
                    </div>
                    <div>
                      <Link
                        to={`/websites/${site.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                      >
                        {site.website_name}
                      </Link>
                      <p className="text-xs text-rose-700 mt-0.5">
                        {site.health.nearestExpiry?.service || 'Service'} is past expiry date!
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/websites/${site.id}`}
                    className="btn btn-secondary text-xs py-1.5 px-3 bg-white text-rose-700 border-rose-300 hover:bg-rose-100"
                  >
                    Resolve Now
                  </Link>
                </div>
              ))}

              {/* Expiring Soon Items */}
              {criticalAlerts.expiringSoon?.map((site) => (
                <div
                  key={`warn-${site.id}`}
                  className="flex items-center justify-between p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                      🟡
                    </div>
                    <div>
                      <Link
                        to={`/websites/${site.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                      >
                        {site.website_name}
                      </Link>
                      <p className="text-xs text-amber-800 mt-0.5">
                        {site.health.nearestExpiry?.service || 'Service'} renewal in{' '}
                        <span className="font-bold">{site.health.nearestExpiry?.daysRemaining} days</span>
                      </p>
                    </div>
                  </div>
                  <Link to={`/websites/${site.id}`} className="btn btn-secondary text-xs py-1.5 px-3 bg-white">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technology Distribution & Quick Stats */}
        <div className="card flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 pb-3 mb-3 border-b border-slate-100">
              Technology Breakdown
            </h2>
            <div className="space-y-2.5">
              {Object.entries(technologyDistribution).length === 0 ? (
                <p className="text-xs text-slate-400">No websites added yet.</p>
              ) : (
                Object.entries(technologyDistribution).map(([tech, count]) => (
                  <div key={tech} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{tech}</span>
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                      {count} {count === 1 ? 'site' : 'sites'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-xl">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <CalendarCheck size={14} className="text-indigo-600" /> Maintained this month:
              </span>
              <span className="font-bold text-slate-900">{overview.maintainedThisMonth || 0} sites</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Users size={14} className="text-indigo-600" /> Total Active Clients:
              </span>
              <span className="font-bold text-slate-900">{overview.totalClients || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Websites Portfolio Table */}
      <div className="card">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Managed Websites</h2>
            <p className="text-xs text-slate-500 mt-0.5">Recently added and active client websites.</p>
          </div>
          <Link to="/websites" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View Full List ({overview.totalWebsites || 0}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <th className="pb-3">Website</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Technology</th>
                <th className="pb-3">Domain</th>
                <th className="pb-3">Hosting</th>
                <th className="pb-3">SSL</th>
                <th className="pb-3">Health</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentWebsites.map((site) => (
                <tr key={site.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="font-medium text-slate-900 flex items-center gap-1.5">
                      <Link to={`/websites/${site.id}`} className="hover:text-indigo-600 hover:underline font-semibold">
                        {site.website_name}
                      </Link>
                      <a
                        href={site.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <span className="text-[11px] text-slate-400">{site.website_url}</span>
                  </td>
                  <td className="py-3.5 text-slate-700 font-medium">
                    {site.client?.name || <span className="text-slate-400 italic">No Client</span>}
                  </td>
                  <td className="py-3.5">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {site.technology}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={site.domain?.status} label={site.domain?.daysRemaining != null ? `${site.domain.daysRemaining}d` : 'N/A'} />
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={site.hosting?.status} label={site.hosting?.daysRemaining != null ? `${site.hosting.daysRemaining}d` : 'N/A'} />
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={site.ssl?.status} label={site.ssl?.daysRemaining != null ? `${site.ssl.daysRemaining}d` : 'N/A'} />
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={site.health.overallStatus} />
                  </td>
                  <td className="py-3.5 text-right">
                    <Link to={`/websites/${site.id}`} className="btn btn-secondary text-xs py-1 px-2.5">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
