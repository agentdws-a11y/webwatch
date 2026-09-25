import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Globe,
  Users,
  ClipboardCheck,
  Bell,
  KeyRound,
  FileBarChart,
  Settings,
  Archive,
  ShieldCheck,
} from 'lucide-react';

const mainNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/websites', label: 'Websites', icon: Globe },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/archive', label: 'Archive Vault', icon: Archive },
];

const secondaryNavItems = [
  { to: '/maintenance', label: 'Maintenance', icon: ClipboardCheck },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/credentials', label: 'Credentials Vault', icon: KeyRound },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function MobileSidebar({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Sliding panel */}
      <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck size={18} />
            </div>
            <span className="text-base font-bold text-slate-900">
              WebWatch<span className="text-indigo-600">360</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <div className="px-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Management
              </span>
            </div>
            <div className="space-y-1">
              {mainNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div>
            <div className="px-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tools &amp; Settings
              </span>
            </div>
            <div className="space-y-1">
              {secondaryNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default MobileSidebar;