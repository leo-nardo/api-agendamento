import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Scissors,
    LogOut,
    UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AppLayout() {
    const { logout, companyName } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { href: '/admin', label: t('dashboard'), icon: LayoutDashboard },
        { href: '/admin/appointments', label: t('appointments'), icon: Calendar },
        { href: '/admin/services', label: t('services'), icon: Scissors },
        { href: '/admin/professionals', label: t('professionals'), icon: UserCircle },
        { href: '/admin/customers', label: t('customers'), icon: Users },
    ];

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r">
                <div className="h-16 flex items-center justify-center border-b px-4">
                    <span className="text-xl font-bold text-primary truncate" title={companyName || 'Agendamento'}>
                        {companyName || 'Agendamento'}
                    </span>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    className={cn(
                                        "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                        location.pathname === item.href
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
                    <span className="text-lg font-bold text-primary">Agendamento</span>
                    {/* Add Mobile Menu Trigger (Hamburger) later if needed, but we use BottomNav */}
                    <Button size="icon" variant="ghost" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                    <Outlet />
                </main>

                {/* Bottom Navigation for Mobile */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around z-50">
                    {navItems.slice(0, 5).map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                location.pathname === item.href
                                    ? "text-primary"
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] truncate">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
