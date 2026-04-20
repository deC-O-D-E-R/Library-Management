import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
    LayoutDashboard, Users, BookOpen, Tag, BarChart3,
    Bell, Settings, BookCheck, RotateCcw, List,
    Banknote, PackageSearch, Search, BookMarked, Receipt, 
    BookmarkCheck, FileDown
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border-l-2
            ${isActive
                ? 'bg-surface text-accent border-l-accent border border-border/60'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface/60 border-l-transparent border border-transparent'
            }`
        }
    >
        <Icon size={15} strokeWidth={isActive => isActive ? 2.5 : 2} />
        <span>{label}</span>
    </NavLink>
);

const SectionLabel = ({ children }) => (
    <p className="text-text-secondary text-[10px] font-semibold uppercase tracking-[1.2px] px-3 pt-3 pb-1.5">
        {children}
    </p>
);

const Sidebar = () => {
    const { isAdmin, isLibrarian } = useAuth();

    const adminLinks = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/books', icon: BookOpen, label: 'Books' },
        { to: '/admin/categories', icon: Tag, label: 'Categories' },
        { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
        { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
        { to: '/admin/config', icon: Settings, label: 'System Config' },
    ];

    const librarianLinks = [
        { to: '/librarian/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/librarian/issue', icon: BookCheck, label: 'Issue Book' },
        { to: '/librarian/return', icon: RotateCcw, label: 'Return Book' },
        { to: '/librarian/circulation', icon: List, label: 'Circulation' },
        { to: '/librarian/reservations', icon: BookmarkCheck, label: 'Reservations' },
        { to: '/librarian/fines', icon: Banknote, label: 'Fines' },
        { to: '/librarian/stock', icon: PackageSearch, label: 'Stock Verification' },
    ];

    const employeeLinks = [
        { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/employee/search', icon: Search, label: 'Search Books' },
        { to: '/employee/my-books', icon: BookMarked, label: 'My Books' },
        { to: '/employee/reservations', icon: BookmarkCheck, label: 'My Reservations' },
        { to: '/employee/my-fines', icon: Receipt, label: 'My Fines' },
        { to: '/employee/book-request', icon: FileDown, label: 'Book Request Form'},
    ];

    return (
        <aside className="fixed top-16 left-0 bottom-0 w-56 bg-sidebar border-r border-border z-30 overflow-y-auto">
            <div className="p-2 flex flex-col gap-0.5">

                {isAdmin() && (
                    <>
                        <SectionLabel>Administration</SectionLabel>
                        {adminLinks.map((link, i) => (
                            <NavItem key={`admin-${i}`} {...link} />
                        ))}

                        <div className="my-2 border-t border-border" />

                        <SectionLabel>Librarian</SectionLabel>
                        {librarianLinks.map((link, i) => (
                            <NavItem key={`lib-${i}`} {...link} />
                        ))}
                    </>
                )}

                {isLibrarian() && !isAdmin() && (
                    <>
                        <SectionLabel>Navigation</SectionLabel>
                        {librarianLinks.map((link, i) => (
                            <NavItem key={i} {...link} />
                        ))}
                    </>
                )}

                {!isAdmin() && !isLibrarian() && (
                    <>
                        <SectionLabel>Navigation</SectionLabel>
                        {employeeLinks.map((link, i) => (
                            <NavItem key={i} {...link} />
                        ))}
                    </>
                )}

            </div>
        </aside>
    );
};

export default Sidebar;