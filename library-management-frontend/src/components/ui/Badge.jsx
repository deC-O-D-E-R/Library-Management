import { getStatusColor, getRoleColor } from '../../utils/helpers';

const Badge = ({ text, type = 'status' }) => {
    const colorClass = type === 'role'
        ? getRoleColor(text)
        : getStatusColor(text);

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${colorClass}`}>
            {text}
        </span>
    );
};

export default Badge;