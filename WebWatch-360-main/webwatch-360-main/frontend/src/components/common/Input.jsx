function Input({ label, error, type = 'text', ...props }) {
  return (
    <div>
      {label && <label className="label-text">{label}</label>}
      <input type={type} className={`input-field ${error ? 'border-red-400' : ''}`} {...props} />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default Input;