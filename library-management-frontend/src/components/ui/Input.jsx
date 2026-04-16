const Input = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                    {label} {required && <span className="text-danger">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`bg-sidebar border ${error ? 'border-danger' : 'border-border'} 
                    text-text-primary rounded-lg px-3 py-2 text-sm 
                    focus:outline-none focus:border-accent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    placeholder:text-text-secondary`}
            />
            {error && <p className="text-danger text-xs">{error}</p>}
        </div>
    );
};

export default Input;