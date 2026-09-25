import { useState, useEffect } from 'react';
import clientService from '../services/clientService';
import { useToast } from '../context/ToastContext';
import { Users, Plus, Search, Mail, Phone, Building, Globe, Edit2, Trash2 } from 'lucide-react';

function ClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll(search);
      setClients(data || []);
    } catch (err) {
      showToast('Failed to load clients.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', company: '', notes: '' });
    setModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      notes: client.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Client name is required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingClient) {
        await clientService.update(editingClient.id, formData);
        showToast('Client updated successfully!');
      } else {
        await clientService.create(formData);
        showToast('Client created successfully!');
      }
      setModalOpen(false);
      fetchClients();
    } catch (err) {
      showToast('Failed to save client.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete client "${name}"? Websites assigned to this client will be unassigned.`)) return;
    try {
      await clientService.delete(id);
      showToast(`Client "${name}" deleted.`);
      fetchClients();
    } catch (err) {
      showToast('Failed to delete client.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your client contacts and track how many websites each client maintains.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary text-xs py-2 px-4 shadow-sm">
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, company, or email..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="card text-center py-14">
          <Users className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-base font-semibold text-slate-800">No clients found</h3>
          <p className="text-xs text-slate-500 mt-1">Get started by creating your first client profile.</p>
          <div className="mt-5">
            <button onClick={handleOpenAddModal} className="btn btn-primary text-xs py-2 px-4">
              <Plus size={14} /> Add Client
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((c) => (
            <div key={c.id} className="card card-hover flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                    {c.company && (
                      <p className="text-xs text-indigo-600 font-medium flex items-center gap-1 mt-0.5">
                        <Building size={12} /> {c.company}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                      title="Edit Client"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                      title="Delete Client"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-slate-600">
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${c.email}`} className="text-slate-800 hover:text-indigo-600 truncate">
                        {c.email}
                      </a>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="text-slate-800">{c.phone}</span>
                    </div>
                  )}
                  {c.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2">
                      {c.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Globe size={14} className="text-indigo-600" /> Active Websites:
                </span>
                <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                  {c.active_websites_count} {c.active_websites_count === 1 ? 'Site' : 'Sites'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingClient ? 'Edit Client Details' : 'Add New Client'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Corp Inc."
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Client preferences, SLA details, etc."
                  className="input"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary text-xs py-2 px-5 font-semibold"
                >
                  {isSubmitting ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsPage;
