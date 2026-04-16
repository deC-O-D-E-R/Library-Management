const Card = ({ title, children, className = '', action = null }) => {
    return (
        <div className={`bg-surface border border-border rounded-xl p-5 ${className}`}>
            {title && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-text-primary font-semibold text-base">{title}</h3>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;