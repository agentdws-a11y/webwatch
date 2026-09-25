import { NavLink } from 'react-router-dom';
import {
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

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:flex md:flex-col justify-between">
      <div className="overflow-y-auto flex-1">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              WebWatch<span className="text-indigo-600">360</span>
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="px-3.5 pt-4">
          <div className="px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Management
            </span>
          </div>

          <nav className="space-y-1">
            {mainNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs font-bold border-l-4 border-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={17} className="flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div className="px-3.5 pt-5 pb-4">
          <div className="px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tools &amp; Settings
            </span>
          </div>

          <nav className="space-y-1">
            {secondaryNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Vault Status */}
      <div className="p-4 m-3 bg-slate-900 text-white rounded-xl text-xs space-y-1">
        <div className="flex items-center justify-between font-bold text-indigo-400">
          <span className="flex items-center gap-1.5">
            <KeyRound size={13} /> Vault Active
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
            AES-256
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight pt-1">
          Single Admin Environment
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;