import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import './i18n';

import AppLayout from '@/layouts/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Services from '@/pages/Services';
import Professionals from '@/pages/Professionals';
import Customers from '@/pages/Customers';
import MyAppointments from '@/pages/MyAppointments';
import NewAppointment from '@/pages/NewAppointment';
import PlatformAdminDashboard from '@/pages/PlatformAdminDashboard';
import ProfessionalProfile from '@/pages/ProfessionalProfile';
import Settings from '@/pages/Settings';
import Storefront from '@/pages/public/Storefront';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

import { Toaster } from '@/components/ui/sonner';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/admin/login" />} />

                    {/* Admin Backoffice Routes */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin/register" element={<Register />} />

                    <Route path="/admin" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                        <Route index element={<Dashboard />} />
                        <Route path="services" element={<Services />} />
                        <Route path="professionals" element={<Professionals />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="profile" element={<ProfessionalProfile />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="appointments" element={<MyAppointments />} />
                        <Route path="appointments/new" element={<NewAppointment />} />
                        <Route path="platform" element={<PlatformAdminDashboard />} />
                    </Route>

                    {/* Public Storefront Routes */}
                    <Route path="/:slug" element={<Storefront />} />
                    <Route path="/:slug/agendar" element={<Storefront />} />
                </Routes>
            </Router>
            <Toaster />
        </AuthProvider>
    );
}

export default App;
