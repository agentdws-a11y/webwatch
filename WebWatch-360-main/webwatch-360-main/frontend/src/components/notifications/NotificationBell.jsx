import { useState, useEffect, useRef } from 'react';
import { Bell, ShieldAlert, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll({ unread_only: true, limit: 5 });
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-xl transition-colors"
        title="Notifications & Expiry Alerts"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Expiry Alerts ({unreadCount})
            </span>
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Centre
            </Link>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-400">
                <CheckCircle size={20} className="mx-auto text-emerald-500 mb-1" />
                No unread expiry alerts
              </div>
            ) : (
              notifications.map((n) => {
                const isCritical = n.title.includes('Critical') || n.title.includes('Expired');
                const isWarning = n.title.includes('Warning') || n.title.includes('Urgent');

                return (
                  <Link
                    key={n.id}
                    to="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 hover:bg-slate-50 text-xs transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex-shrink-0">
                        {isCritical ? (
                          <ShieldAlert className="text-rose-600" size={15} />
                        ) : isWarning ? (
                          <AlertTriangle className="text-amber-500" size={15} />
                        ) : (
                          <Info className="text-blue-500" size={15} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{n.title}</p>
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center py-2.5 bg-slate-50 text-xs text-indigo-600 hover:text-indigo-800 font-bold border-t border-slate-100"
          >
            Open Notification Centre →
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;