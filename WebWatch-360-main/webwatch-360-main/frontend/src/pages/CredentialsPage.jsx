import { useState, useEffect } from 'react';
import credentialService from '../services/credentialService';
import websiteService from '../services/websiteService';
import { useToast } from '../context/ToastContext';
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Lock,
  Globe,
  ExternalLink,
  Trash2,
  Edit2,
  Search,
  Filter,
  X,
} from 'lucide-react';

const SERVICE_TYPES = [
  'Hosting cPanel/DirectAdmin',
  'Domain Registrar',
  'WordPress / CMS Admin',
  'Database / phpMyAdmin',
  'FTP / SFTP',
  'SSH / Server Root',
  'CDN / Cloudflare',
  'Transactional Email',
  'Other',
];

function CredentialsPage() {
  const { showToast } = useToast();
  const [credentials, setCredentials] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [filterSiteId, setFilterSiteId] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState(null);
  const [formData, setFormData] = useState({
    website_id: '',
    service_type: SERVICE_TYPES[0],
    username: '',
    password: '',
    login_url: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSiteId) params.website_id = filterSiteId;
      const data = await credentialService.getAll(params);
      setCredentials(data || []);
    } catch (err) {
      showToast('Failed to load credentials vault.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWebsites = async () => {
    try {
      const data = await websiteService.getAll({ is_archived: false, limit: 100 });
      setWebsites(data.websites || []);
      if (data.websites?.length > 0 && !formData.website_id) {
        setFormData((prev) => ({ ...prev, website_id: data.websites[0].id }));
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [filterSiteId]);

  const toggleReveal = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const handleOpenAddModal = () => {
    setEditingCred(null);
    setFormData({
      website_id: websites[0]?.id || '',
      service_type: SERVICE_TYPES[0],
      username: '',
      password: '',
      login_url: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (cred) => {
    setEditingCred(cred);
    setFormData({
      website_id: cred.website_id,
      service_type: cred.service_type,
      username: cred.username,
      password: cred.password || '',
      login_url: cred.login_url || '',
      notes: cred.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.website_id || !formData.username || !formData.password) {
      showToast('Website, username, and password are required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCred) {
        await credentialService.update(editingCred.id, formData);
        showToast('Credential updated in vault.');
      } else {
        await credentialService.create(formData);
        showToast('Credential encrypted with AES-256 and saved.');
      }
      setModalOpen(false);
      fetchCredentials();
    } catch (err) {
      showToast('Failed to save credential.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, serviceName, siteName) => {
    if (!window.confirm(`Delete "${serviceName}" credentials for "${siteName}" from vault?`)) return;
    try {
      await credentialService.delete(id);
      showToast('Credential deleted from vault.');
      fetchCredentials();
    } catch (err) {
      showToast('Failed to delete credential.', 'error');
    }
  };

  const filteredCredentials = credentials.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      item.website_name?.toLowerCase().includes(term) ||
      item.service_type?.toLowerCase().includes(term) ||
      item.username?.toLowerCase().includes(term) ||
      item.notes?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Credentials Vault</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={13} /> AES-256 Encrypted at Rest
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Mandatory Section 3.5: Securely store hosting, registrar, and CMS logins behind application authentication.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary text-xs py-2 px-4 shadow-sm">
          <Plus size={16} /> Add New Credential
        </button>
      </div>

      {/* Security Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold">End-to-End Cryptographic Protection</h4>
            <p className="text-xs text-slate-300">
              Passwords are encrypted using AES-256-GCM with unique Initialization Vectors (IVs) and authentication tags.
            </p>
          </div>
        </div>
        <span className="text-xs text-indigo-300 font-mono bg-indigo-950/80 px-3 py-1.5 rounded-lg border border-indigo-800">
          AES-256-GCM Active
        </span>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search credentials by website, service type, or username..."
            className="input pl-10"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterSiteId}
            onChange={(e) => setFilterSiteId(e.target.value)}
            className="select"
          >
            <option value="">All Websites ({credentials.length})</option>
            {websites.map((w) => (
              <option key={w.id} value={w.id}>
                {w.website_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vault Items Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="card text-center py-16">
          <KeyRound size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No Credentials Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click "Add New Credential" to securely store hosting, CMS, or registrar credentials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCredentials.map((item) => (
            <div key={item.id} className="card card-hover flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.website_name}</h3>
                    <span className="text-xs text-indigo-600 font-semibold">{item.service_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.login_url && (
                      <a
                        href={item.login_url.startsWith('http') ? item.login_url : `https://${item.login_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                        title="Open Login Portal"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                      title="Edit Credential"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.service_type, item.website_name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete from Vault"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Username:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                    <span className="select-all">{item.username}</span>
                    <button
                      onClick={() => copyToClipboard(item.username, 'Username')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Copy Username"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Password:</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="font-bold text-slate-900 select-all">
                      {revealed[item.id] ? item.password : '••••••••••••••••'}
                    </span>
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      title={revealed[item.id] ? 'Hide Password' : 'Show Password'}
                    >
                      {revealed[item.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.password, 'Password')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Copy Password"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                {item.notes && <p className="text-[11px] text-slate-500 italic">{item.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <KeyRound size={18} className="text-indigo-600" />
                <span>{editingCred ? 'Edit Credential' : 'Add Vault Credential'}</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Website</label>
                <select
                  value={formData.website_id}
                  onChange={(e) => setFormData({ ...formData, website_id: e.target.value })}
                  className="select"
                  required
                >
                  {websites.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.website_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="select"
                >
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username / Login ID</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. admin_wp or server_root"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter strong password to encrypt"
                  className="input font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Login URL (Optional)</label>
                <input
                  type="url"
                  value={formData.login_url}
                  onChange={(e) => setFormData({ ...formData, login_url: e.target.value })}
                  placeholder="https://example.com/wp-admin"
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Additional access instructions..."
                  className="input"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  {isSubmitting ? 'Encrypting & Saving...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CredentialsPage;
