const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    disabled = false,
    className = '',
    size = 'md'
}) => {
    const base = 'font-semibold rounded-lg transition-all duration-200 flex items-center gap-2';

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const variants = {
        primary: 'bg-accent text-primary hover:bg-amber-400 disabled:opacity-50',
        secondary: 'bg-surface text-text-primary border border-border hover:bg-opacity-80 disabled:opacity-50',
        danger: 'bg-red-900 text-red-400 border border-red-800 hover:bg-red-800 disabled:opacity-50',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-50',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;