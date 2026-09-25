import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../services/websiteService';
import clientService from '../services/clientService';
import { useToast } from '../context/ToastContext';
import {
  Globe,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Archive,
  Trash2,
  Edit,
  LayoutGrid,
  List,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import StatusBadge from '../components/websites/StatusBadge';

function WebsitesPage() {
  const { showToast } = useToast();
  const [websites, setWebsites] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'safe' | 'warning' | 'expired'
  const [techFilter, setTechFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const params = {
        is_archived: false,
        limit: 100,
      };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (techFilter) params.technology = techFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (clientFilter) params.client_id = clientFilter;

      const data = await websiteService.getAll(params);
      setWebsites(data.websites || []);
    } catch (err) {
      showToast('Failed to load websites.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clientService.getAll().then((data) => setClients(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWebsites();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, techFilter, priorityFilter, clientFilter]);

  const handleArchive = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive "${name}"? It can be restored anytime.`)) return;
    try {
      await websiteService.archive(id);
      showToast(`Website "${name}" archived.`);
      fetchWebsites();
    } catch (err) {
      showToast('Failed to archive website.', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This action cannot be undone.`)) return;
    try {
      await websiteService.delete(id);
      showToast(`Website "${name}" deleted permanently.`);
      fetchWebsites();
    } catch (err) {
      showToast('Failed to delete website.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Managed Websites</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor client portfolio, hosting renewals, domains, and SSL certificate validity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/websites/add" className="btn btn-primary text-xs py-2 px-4 shadow-sm">
            <Plus size={16} /> Add Website
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by website name, URL, or client..."
              className="input pl-10"
            />
          </div>

          {/* Quick Status Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-full md:w-auto overflow-x-auto">
            {[
              { key: 'all', label: 'All' },
              { key: 'safe', label: '🟢 Safe' },
              { key: 'warning', label: '🟡 Expiring Soon' },
              { key: 'expired', label: '🔴 Expired' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400'}`}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Client Filter */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="select text-xs py-1.5"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ''}
              </option>
            ))}
          </select>

          {/* Technology Filter */}
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="select text-xs py-1.5"
          >
            <option value="">All Technologies</option>
            <option value="WordPress">WordPress</option>
            <option value="Shopify">Shopify</option>
            <option value="React">React</option>
            <option value="Next.js">Next.js</option>
            <option value="Laravel">Laravel</option>
            <option value="ASP.NET">ASP.NET</option>
            <option value="HTML/Static">HTML/Static</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="select text-xs py-1.5"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : websites.length === 0 ? (
        <div className="card text-center py-14">
          <Globe className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-base font-semibold text-slate-800">No websites match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or add a new website to your maintenance tracker.
          </p>
          <div className="mt-5">
            <Link to="/websites/add" className="btn btn-primary text-xs py-2 px-4">
              <Plus size={14} /> Add Website
            </Link>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Website</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Tech &amp; Plan</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Hosting</th>
                  <th className="py-3 px-4">SSL</th>
                  <th className="py-3 px-4">Health</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {websites.map((site) => (
                  <tr key={site.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 flex items-center gap-1.5">
                        <Link
                          to={`/websites/${site.id}`}
                          className="hover:text-indigo-600 hover:underline font-semibold"
                        >
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
                      <span className="text-[11px] text-slate-400 block">{site.website_url}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {site.client ? (
                        <div>
                          <div className="font-medium">{site.client.name}</div>
                          <span className="text-[11px] text-slate-400">{site.client.company}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Client</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium mr-1">
                        {site.technology}
                      </span>
                      <span className="text-[11px] text-slate-500">{site.support_plan}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={site.domain?.status}
                        label={site.domain?.daysRemaining != null ? `${site.domain.daysRemaining}d` : 'N/A'}
                      />
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {site.domain?.registrar || 'Registrar'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={site.hosting?.status}
                        label={site.hosting?.daysRemaining != null ? `${site.hosting.daysRemaining}d` : 'N/A'}
                      />
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {site.hosting?.provider || 'Hosting'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={site.ssl?.status}
                        label={site.ssl?.daysRemaining != null ? `${site.ssl.daysRemaining}d` : 'N/A'}
                      />
                      <span className="block text-[10px] text-slate-400 mt-0.5">{site.ssl?.issuer || 'SSL'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={site.health.overallStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/websites/${site.id}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100"
                          title="View Details"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleArchive(site.id, site.website_name)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 rounded hover:bg-slate-100"
                          title="Archive Website (Soft Delete)"
                        >
                          <Archive size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(site.id, site.website_name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                          title="Permanent Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {websites.map((site) => (
            <div key={site.id} className="card card-hover flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <div>
                    <Link
                      to={`/websites/${site.id}`}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600"
                    >
                      {site.website_name}
                    </Link>
                    <a
                      href={site.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mt-0.5"
                    >
                      {site.website_url} <ExternalLink size={10} />
                    </a>
                  </div>
                  <StatusBadge status={site.health.overallStatus} />
                </div>

                <div className="text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client:</span>
                    <span className="font-semibold text-slate-800">{site.client?.name || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Technology:</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">{site.technology}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-slate-400">Domain ({site.domain?.daysRemaining ?? 'N/A'}d):</span>
                    <StatusBadge status={site.domain?.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Hosting ({site.hosting?.daysRemaining ?? 'N/A'}d):</span>
                    <StatusBadge status={site.hosting?.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">SSL ({site.ssl?.daysRemaining ?? 'N/A'}d):</span>
                    <StatusBadge status={site.ssl?.status} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <span className="text-[11px] font-medium text-slate-400">Plan: {site.support_plan}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleArchive(site.id, site.website_name)}
                    className="btn btn-secondary text-xs py-1 px-2 text-slate-500"
                    title="Archive"
                  >
                    <Archive size={12} />
                  </button>
                  <Link to={`/websites/${site.id}`} className="btn btn-primary text-xs py-1 px-3">
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WebsitesPage;
