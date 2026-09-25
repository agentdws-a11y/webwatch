import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { KeyRound, ShieldCheck, Eye, EyeOff, Copy, Plus, Lock, Globe, ExternalLink } from 'lucide-react';

function CredentialsPage() {
  const { showToast } = useToast();
  const [revealed, setRevealed] = useState({});

  const [vaultItems] = useState([
    {
      id: 1,
      website: 'Acme Corporate Portal',
      service: 'Hosting cPanel',
      username: 'acme_admin_sg',
      password: 'Acme@SiteGround#2026!',
      loginUrl: 'https://my.siteground.com',
      notes: 'SiteGround GoGeek control panel',
    },
    {
      id: 2,
      website: 'Acme Corporate Portal',
      service: 'WordPress Admin',
      username: 'superadmin',
      password: 'Wp#AcmeSecureMaster99',
      loginUrl: 'https://acme-corp.com/wp-admin',
      notes: 'Primary WP Administrator',
    },
    {
      id: 3,
      website: 'Apex Luxury Fashion',
      service: 'Shopify Staff Admin',
      username: 'lead_dev@apexretail.co.uk',
      password: 'ShopifyApex#Secret2026',
      loginUrl: 'https://apexretail.myshopify.com/admin',
      notes: 'Shopify Plus developer staff login',
    },
  ]);

  const toggleReveal = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Credentials Vault</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={13} /> AES-256 Encrypted
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Mandatory Vault: Securely store hosting, registrar, and CMS logins behind application authentication.
          </p>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 bg-indigo-900 text-white rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-800 flex items-center justify-center text-indigo-300">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold">Encrypted at Rest</h4>
            <p className="text-xs text-indigo-200">
              Passwords are never logged or exposed in plain text in database backups.
            </p>
          </div>
        </div>
      </div>

      {/* Vault Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vaultItems.map((item) => (
          <div key={item.id} className="card card-hover flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.website}</h3>
                  <span className="text-xs text-indigo-600 font-semibold">{item.service}</span>
                </div>
                {item.loginUrl && (
                  <a
                    href={item.loginUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                    title="Open Login URL"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {/* Username */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Username:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                  <span>{item.username}</span>
                  <button
                    onClick={() => copyToClipboard(item.username, 'Username')}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Copy Username"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Password:</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="font-bold text-slate-900">
                    {revealed[item.id] ? item.password : '••••••••••••••••'}
                  </span>
                  <button
                    onClick={() => toggleReveal(item.id)}
                    className="p-1 text-slate-400 hover:text-indigo-600"
                    title={revealed[item.id] ? 'Hide Password' : 'Show Password'}
                  >
                    {revealed[item.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(item.password, 'Password')}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Copy Password"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {item.notes && <p className="text-[11px] text-slate-400">{item.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CredentialsPage;
