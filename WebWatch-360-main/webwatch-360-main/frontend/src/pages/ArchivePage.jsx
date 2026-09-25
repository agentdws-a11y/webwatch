import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../services/websiteService';
import { useToast } from '../context/ToastContext';
import { Archive, RotateCcw, Trash2, Globe, Search, ExternalLink } from 'lucide-react';
import StatusBadge from '../components/websites/StatusBadge';

function ArchivePage() {
  const { showToast } = useToast();
  const [archivedWebsites, setArchivedWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchArchived = async () => {
    try {
      setLoading(true);
      const data = await websiteService.getAll({ is_archived: true, search });
      setArchivedWebsites(data.websites || []);
    } catch (err) {
      showToast('Failed to load archived websites.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, [search]);

  const handleRestore = async (id, name) => {
    try {
      await websiteService.restore(id);
      showToast(`Website "${name}" restored to active websites list!`);
      fetchArchived();
    } catch (err) {
      showToast('Failed to restore website.', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently destroy all records for "${name}"? This cannot be undone.`)) return;
    try {
      await websiteService.delete(id);
      showToast(`Website "${name}" permanently deleted.`);
      fetchArchived();
    } catch (err) {
      showToast('Failed to delete website.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Archived Websites</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Historical websites that are no longer actively maintained. Records and logs are preserved.
        </p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archived websites..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : archivedWebsites.length === 0 ? (
        <div className="card text-center py-14">
          <Archive className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-base font-semibold text-slate-800">Archive is empty</h3>
          <p className="text-xs text-slate-500 mt-1">
            When you archive websites from the main portfolio, they will appear here safely preserved.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Website</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Technology</th>
                  <th className="py-3 px-4">Archived Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {archivedWebsites.map((site) => (
                  <tr key={site.id} className="hover:bg-slate-50/80 transition-colors opacity-90">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 flex items-center gap-1.5">
                        <Link to={`/websites/${site.id}`} className="hover:underline font-semibold">
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
                      {site.client?.name || <span className="text-slate-400 italic">No Client</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {site.technology}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {site.archived_at ? new Date(site.archived_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(site.id, site.website_name)}
                          className="btn btn-secondary text-xs py-1.5 px-3 text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                          title="Restore Website"
                        >
                          <RotateCcw size={13} /> Restore
                        </button>
                        <button
                          onClick={() => handleDelete(site.id, site.website_name)}
                          className="btn btn-danger text-xs py-1.5 px-2.5"
                          title="Permanent Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArchivePage;
