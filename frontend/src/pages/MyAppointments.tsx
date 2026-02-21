import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Appointment {
    id: string;
    startTime: string; // ISO
    endTime: string;
    service: { name: string };
    professional: { name: string };
    customer: { name: string };
    status: string;
}

export default function MyAppointments() {
    const { t } = useTranslation();

    const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
        queryKey: ['appointments'],
        queryFn: async () => {
            const response = await api.get('/appointments');
            return response.data;
        },
    });

    if (isLoading) return <div className="p-8">Loading appointments...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading appointments</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('appointments') || 'Agendamentos'}</h1>
                <Button onClick={() => window.location.href = '/admin/appointments/new'}>
                    Nova Reserva
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appointments?.map((apt) => (
                    <Card key={apt.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base font-semibold">
                                    {apt.service?.name || "Service"}
                                </CardTitle>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${apt.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                                    apt.status === 'CANCELED' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                                    }`}>
                                    {apt.status}
                                </span>
                            </div>
                            <CardDescription>
                                with {apt.professional?.name || "Professional"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">
                                <p><strong>Date:</strong> {format(new Date(apt.startTime), 'PPP')}</p>
                                <p><strong>Time:</strong> {format(new Date(apt.startTime), 'p')} - {format(new Date(apt.endTime), 'p')}</p>
                                <p className="mt-2 text-gray-500 text-xs">Customer: {apt.customer?.name}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {appointments?.length === 0 && <p className="text-gray-500">No appointments found.</p>}
            </div>
        </div>
    );
}
