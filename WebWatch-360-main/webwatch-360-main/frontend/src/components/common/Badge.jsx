function Badge({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-primary-50 text-primary-700',
    green: 'bg-status-safe/10 text-status-safe',
    yellow: 'bg-status-warning/10 text-status-warning',
    red: 'bg-status-expired/10 text-status-expired',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

export default Badge;