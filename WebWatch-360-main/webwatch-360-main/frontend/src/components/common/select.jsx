function Select({ label, error, options = [], ...props }) {
  return (
    <div>
      {label && <label className="label-text">{label}</label>}
      <select className={`input-field ${error ? 'border-red-400' : ''}`} {...props}>
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default Select;