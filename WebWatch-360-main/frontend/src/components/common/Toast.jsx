import { CheckCircle2, XCircle, X } from 'lucide-react';

function Toast({ message, type = 'success', onClose }) {
  const styles = {
    success: 'bg-white border-status-safe/30 text-gray-800',
    error: 'bg-white border-status-expired/30 text-gray-800',
  };
  const Icon = type === 'success' ? CheckCircle2 : XCircle;
  const iconColor = type === 'success' ? 'text-status-safe' : 'text-status-expired';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} min-w-[260px]`}>
      <Icon size={18} className={iconColor} />
      <span className="text-sm flex-1">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X size={14} />
      </button>
    </div>
  );
}

export default Toast;