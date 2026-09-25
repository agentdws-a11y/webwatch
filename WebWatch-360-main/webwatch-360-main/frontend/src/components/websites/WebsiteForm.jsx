import { useState, useEffect } from 'react';
import clientService from '../../services/clientService';
import { Globe, Server, Shield, Mail, Calendar, DollarSign, Tag, FileText } from 'lucide-react';

function WebsiteForm({ initialData = {}, onSubmit, isSubmitting = false, submitLabel = 'Save Website' }) {
  const [clients, setClients] = useState([]);

  const [formData, setFormData] = useState({
    website_name: initialData.website_name || '',
    website_url: initialData.website_url || '',
    client_id: initialData.client_id || initialData.client?.id || '',
    technology: initialData.technology || 'WordPress',
    hosting_provider: initialData.hosting_provider || '',
    domain_provider: initialData.domain_provider || '',
    date_built: initialData.date_built ? initialData.date_built.split('T')[0] : '',
    support_plan: initialData.support_plan || 'Basic Monthly',
    priority: initialData.priority || 'Medium',
    tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''),
    notes: initialData.notes || '',

    // Hosting
    hosting: {
      provider: initialData.hosting?.provider || '',
      plan_name: initialData.hosting?.plan_name || '',
      renewal_date: initialData.hosting?.renewal_date ? initialData.hosting.renewal_date.split('T')[0] : '',
      cost: initialData.hosting?.cost || '',
      auto_renew: initialData.hosting?.auto_renew ?? true,
      notes: initialData.hosting?.notes || '',
    },

    // Domain
    domain: {
      registrar: initialData.domain?.registrar || '',
      expiry_date: initialData.domain?.expiry_date ? initialData.domain.expiry_date.split('T')[0] : '',
      cost: initialData.domain?.cost || '',
      auto_renew: initialData.domain?.auto_renew ?? true,
      notes: initialData.domain?.notes || '',
    },

    // SSL
    ssl: {
      issuer: initialData.ssl?.issuer || "Let's Encrypt / Auto SSL",
      expiry_date: initialData.ssl?.expiry_date ? initialData.ssl.expiry_date.split('T')[0] : '',
      ssl_type: initialData.ssl?.ssl_type || 'Auto SSL',
      auto_renew: initialData.ssl?.auto_renew ?? true,
    },

    // Business Email & CDN
    email_cdn: {
      email_provider: initialData.email_cdn?.email_provider || '',
      email_expiry_date: initialData.email_cdn?.email_expiry_date ? initialData.email_cdn.email_expiry_date.split('T')[0] : '',
      cdn_provider: initialData.email_cdn?.cdn_provider || '',
      cdn_expiry_date: initialData.email_cdn?.cdn_expiry_date ? initialData.email_cdn.cdn_expiry_date.split('T')[0] : '',
    },
  });

  useEffect(() => {
    clientService.getAll().then((data) => setClients(data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Parse tags into array
    const tagArray = typeof formData.tags === 'string'
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : formData.tags;

    const payload = {
      ...formData,
      client_id: formData.client_id ? parseInt(formData.client_id, 10) : null,
      tags: tagArray,
      hosting: {
        ...formData.hosting,
        cost: formData.hosting.cost ? parseFloat(formData.hosting.cost) : 0,
      },
      domain: {
        ...formData.domain,
        cost: formData.domain.cost ? parseFloat(formData.domain.cost) : 0,
      },
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      {/* 1. Core General Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold border-b border-slate-200 pb-2">
          <Globe size={18} />
          <span>General Website Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Website Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="website_name"
              value={formData.website_name}
              onChange={handleChange}
              placeholder="e.g. Acme Corp Portal"
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Website URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Client</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className="select"
            >
              <option value="">-- No Client Assigned --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Technology Stack</label>
            <select
              name="technology"
              value={formData.technology}
              onChange={handleChange}
              className="select"
            >
              <option value="WordPress">WordPress</option>
              <option value="Shopify">Shopify</option>
              <option value="React">React</option>
              <option value="Next.js">Next.js</option>
              <option value="Laravel">Laravel</option>
              <option value="ASP.NET">ASP.NET</option>
              <option value="Vue.js">Vue.js</option>
              <option value="Node.js">Node.js</option>
              <option value="HTML/Static">HTML / Static</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Support Plan</label>
            <select
              name="support_plan"
              value={formData.support_plan}
              onChange={handleChange}
              className="select"
            >
              <option value="Basic Monthly">Basic Monthly</option>
              <option value="Standard Maintenance">Standard Maintenance</option>
              <option value="Premium 24/7">Premium 24/7</option>
              <option value="Custom Retainer">Custom Retainer</option>
              <option value="None">None</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="select"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date Built / Launched</label>
            <input
              type="date"
              name="date_built"
              value={formData.date_built}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="E-Commerce, WordPress, High Priority"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* 2. Hosting & Domain Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
        {/* Hosting Details */}
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <Server size={16} />
            <span>Hosting Provider &amp; Renewal</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Hosting Provider / Host</label>
            <input
              type="text"
              value={formData.hosting.provider}
              onChange={(e) => handleNestedChange('hosting', 'provider', e.target.value)}
              placeholder="e.g. SiteGround, AWS, Hostinger"
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Plan Name</label>
            <input
              type="text"
              value={formData.hosting.plan_name}
              onChange={(e) => handleNestedChange('hosting', 'plan_name', e.target.value)}
              placeholder="e.g. GoGeek, Cloud VPS, Droplet 4GB"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Renewal Date</label>
              <input
                type="date"
                value={formData.hosting.renewal_date}
                onChange={(e) => handleNestedChange('hosting', 'renewal_date', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cost ($ / yr)</label>
              <input
                type="number"
                step="0.01"
                value={formData.hosting.cost}
                onChange={(e) => handleNestedChange('hosting', 'cost', e.target.value)}
                placeholder="120.00"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Domain Details */}
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <Globe size={16} />
            <span>Domain Registrar &amp; Expiry</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Domain Registrar</label>
            <input
              type="text"
              value={formData.domain.registrar}
              onChange={(e) => handleNestedChange('domain', 'registrar', e.target.value)}
              placeholder="e.g. Namecheap, GoDaddy, Porkbun"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.domain.expiry_date}
                onChange={(e) => handleNestedChange('domain', 'expiry_date', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cost ($ / yr)</label>
              <input
                type="number"
                step="0.01"
                value={formData.domain.cost}
                onChange={(e) => handleNestedChange('domain', 'cost', e.target.value)}
                placeholder="15.00"
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SSL & Business Email / CDN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
        {/* SSL Details */}
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <Shield size={16} />
            <span>SSL Certificate Expiry</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Certificate Issuer</label>
            <input
              type="text"
              value={formData.ssl.issuer}
              onChange={(e) => handleNestedChange('ssl', 'issuer', e.target.value)}
              placeholder="e.g. Let's Encrypt, Cloudflare, DigiCert"
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">SSL Expiry Date</label>
            <input
              type="date"
              value={formData.ssl.expiry_date}
              onChange={(e) => handleNestedChange('ssl', 'expiry_date', e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Business Email & CDN */}
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <Mail size={16} />
            <span>Business Email &amp; CDN</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Provider</label>
              <input
                type="text"
                value={formData.email_cdn.email_provider}
                onChange={(e) => handleNestedChange('email_cdn', 'email_provider', e.target.value)}
                placeholder="Google Workspace"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Expiry</label>
              <input
                type="date"
                value={formData.email_cdn.email_expiry_date}
                onChange={(e) => handleNestedChange('email_cdn', 'email_expiry_date', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">CDN Provider</label>
              <input
                type="text"
                value={formData.email_cdn.cdn_provider}
                onChange={(e) => handleNestedChange('email_cdn', 'cdn_provider', e.target.value)}
                placeholder="Cloudflare / Fastly"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">CDN Expiry</label>
              <input
                type="date"
                value={formData.email_cdn.cdn_expiry_date}
                onChange={(e) => handleNestedChange('email_cdn', 'cdn_expiry_date', e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Developer Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Special deployment notes, staging URLs, plugins or client preferences..."
          className="input"
        ></textarea>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary px-6 py-2.5 text-sm font-semibold"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default WebsiteForm;
