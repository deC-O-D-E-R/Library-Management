import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black bg-opacity-70"
                onClick={onClose}
            />
            <div className={`relative bg-surface border border-border rounded-2xl p-6 w-full ${sizes[size]} mx-4 z-10 max-h-screen overflow-y-auto`}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-text-primary font-semibold text-lg">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;