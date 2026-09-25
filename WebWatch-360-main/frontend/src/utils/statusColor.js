/**
 * Calculates expiry status based on days remaining.
 * Matches project requirement:
 * 🟢 Safe: >30 days | 🟡 Expiring Soon: ≤30 days | 🔴 Expired: past date
 */

export const EXPIRY_STATUS = {
  SAFE: 'safe',
  WARNING: 'warning',
  EXPIRED: 'expired',
};

export function getExpiryStatus(expiryDate) {
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return EXPIRY_STATUS.EXPIRED;
  } else if (diffDays <= 30) {
    return EXPIRY_STATUS.WARNING;
  } else {
    return EXPIRY_STATUS.SAFE;
  }
}

export function getDaysRemaining(expiryDate) {
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getStatusConfig(status) {
  const configs = {
    [EXPIRY_STATUS.SAFE]: {
      label: 'Safe',
      badgeClass: 'badge-safe',
      dotColor: 'bg-status-safe',
    },
    [EXPIRY_STATUS.WARNING]: {
      label: 'Expiring Soon',
      badgeClass: 'badge-warning',
      dotColor: 'bg-status-warning',
    },
    [EXPIRY_STATUS.EXPIRED]: {
      label: 'Expired',
      badgeClass: 'badge-expired',
      dotColor: 'bg-status-expired',
    },
  };

  return configs[status] || null;
}