import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Clock,
  Info,
  RefreshCw,
  Trash2,
  Check,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll({ unread_only: filterUnread });
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      showToast('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterUnread]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await notificationService.syncReminders();
      showToast(res.message || 'Expiries scanned and reminders updated!');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to synchronize reminders.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      showToast('Alert marked as read.');
    } catch (err) {
      showToast('Failed to update alert.', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read.');
    } catch (err) {
      showToast('Failed to mark all as read.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast('Notification deleted.');
    } catch (err) {
      showToast('Failed to delete notification.', 'error');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Centre</h1>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated alerts firing at 30, 15, 7 days before expiry and on expiry day.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-secondary text-xs py-2 px-3"
            title="Scan websites and generate upcoming expiry reminders"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Scanning...' : 'Scan Expiries'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn btn-secondary text-xs py-2 px-3"
            >
              <CheckCircle size={14} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnread(false)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              !filterUnread ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilterUnread(true)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filterUnread ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card text-center py-16">
            <Bell size={32} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-400 mt-1">
              All client renewals are in good standing. No urgent alerts at this moment.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const isExpired = n.title.includes('Critical') || n.title.includes('Expired');
            const isWarning = n.title.includes('Warning') || n.title.includes('Urgent');

            return (
              <div
                key={n.id}
                className={`card p-4 transition-all flex items-start gap-4 ${
                  !n.is_read
                    ? 'border-indigo-300 bg-indigo-50/40 shadow-sm'
                    : 'border-slate-200 bg-white opacity-85'
                }`}
              >
                <div className="mt-1">
                  {isExpired ? (
                    <ShieldAlert className="text-rose-600" size={22} />
                  ) : isWarning ? (
                    <AlertTriangle className="text-amber-500" size={22} />
                  ) : (
                    <Info className="text-blue-500" size={22} />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {n.title}
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                      )}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-400">
                      {formatDate(n.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                  {n.website_name && (
                    <div className="flex items-center gap-3 pt-2 text-[11px]">
                      <Link
                        to={`/websites/${n.website_id}`}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Globe size={12} /> {n.website_name}
                      </Link>
                      {n.target_date && (
                        <span className="text-slate-400">Target Expiry: {n.target_date}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                    title="Delete alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
