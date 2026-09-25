import { useState } from 'react';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle, Clock, Info } from 'lucide-react';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'ssl',
      title: '🔴 Critical: SSL Certificate Expired',
      message: 'DigiCert EV SSL certificate for TechNova SaaS Platform expired 3 days ago!',
      target_date: '3 days ago',
      is_read: false,
      severity: 'high',
    },
    {
      id: 2,
      type: 'hosting',
      title: '🟡 Warning: Hosting Expiring in 15 Days',
      message: 'Shopify Plus hosting renewal for Apex Luxury Fashion is due in 15 days.',
      target_date: 'In 15 days',
      is_read: false,
      severity: 'medium',
    },
    {
      id: 3,
      type: 'domain',
      title: '🟡 Reminder: Domain Renewal in 20 Days',
      message: 'GoDaddy domain apexretail.co.uk is due for renewal in 20 days.',
      target_date: 'In 20 days',
      is_read: true,
      severity: 'low',
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Centre</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated alerts firing at 30, 15, 7 days before expiry and on expiry day.
          </p>
        </div>
        <button onClick={markAllAsRead} className="btn btn-secondary text-xs py-2 px-3">
          <CheckCircle size={14} /> Mark All as Read
        </button>
      </div>

      <div className="card space-y-3 p-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-all ${
              !n.is_read
                ? 'bg-indigo-50/50 border-indigo-200'
                : 'bg-white border-slate-200 opacity-80'
            } flex items-start gap-3.5`}
          >
            <div className="mt-0.5">
              {n.severity === 'high' ? (
                <ShieldAlert className="text-rose-600" size={20} />
              ) : n.severity === 'medium' ? (
                <AlertTriangle className="text-amber-500" size={20} />
              ) : (
                <Info className="text-blue-500" size={20} />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                <span className="text-[11px] font-medium text-slate-400">{n.target_date}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;
