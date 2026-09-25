import { useState } from 'react';
import { Menu, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import MobileSidebar from './MobileSidebar';

function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">
        {/* Mobile menu button */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation"
          >
            <Menu size={22} />
          </button>

          <div className="md:hidden flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck size={16} />
            </div>
            <span className="text-base font-bold text-slate-900">WebWatch<span className="text-indigo-600">360</span></span>
          </div>
        </div>

        <div className="hidden md:block">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Admin Maintenance Workspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 text-slate-700 hover:bg-slate-100 rounded-xl px-2.5 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-800">
                {user?.name || 'Admin'}
              </span>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@webwatch360.com'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}

export default Navbar;