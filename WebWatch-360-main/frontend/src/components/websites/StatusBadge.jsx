import { getExpiryStatus, getDaysRemaining, getStatusConfig, EXPIRY_STATUS } from '../../utils/statusColor';

function StatusBadge({ status: explicitStatus, expiryDate, label, showDays = false }) {
  let resolvedStatus = explicitStatus;
  let days = null;

  if (!resolvedStatus && expiryDate) {
    resolvedStatus = getExpiryStatus(expiryDate);
    days = getDaysRemaining(expiryDate);
  }

  if (!resolvedStatus) {
    return <span className="text-slate-400 text-xs italic">Not set</span>;
  }

  const config = getStatusConfig(resolvedStatus) || {
    label: resolvedStatus,
    badgeClass: 'badge-safe',
    dotColor: 'bg-emerald-500',
  };

  let displayLabel = label || config.label;
  if (showDays && days !== null) {
    displayLabel += ` (${days >= 0 ? `${days}d` : `${Math.abs(days)}d ago`})`;
  }

  return (
    <span className={config.badgeClass}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;