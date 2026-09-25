function Button({ children, variant = 'primary', type = 'button', onClick, disabled, className = '', icon: Icon }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export default Button;