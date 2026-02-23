import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import CalendarGrid, { CalendarEvent } from '@/components/CalendarGrid';
import { useAuth } from '@/context/AuthContext';
import { BlockTimeModal } from '@/components/BlockTimeModal';

interface AppointmentResponse {
    id: string;
    startTime: string; // ISO
    endTime: string;
    service?: { name: string };
    professional?: { id: string; fullName: string };
    customer?: { fullName: string };
    status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELED' | 'BLOCKED' | 'COMPLETED';
}

export default function MyAppointments() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const isOwner = user?.role === 'OWNER';

    const { data: professionals } = useQuery<any[]>({
        queryKey: ['professionals'],
        queryFn: async () => {
            const response = await api.get('/professionals');
            return response.data;
        },
        enabled: isOwner
    });

    const { data: myProfile } = useQuery<any>({
        queryKey: ['my-profile'],
        queryFn: async () => {
            const response = await api.get('/professionals/me');
            return response.data;
        },
        enabled: !isOwner
    });

    const { data: rawAppointments, isLoading, error } = useQuery<AppointmentResponse[]>({
        queryKey: ['appointments'],
        queryFn: async () => {
            const response = await api.get('/appointments');
            return response.data;
        },
    });

    if (isLoading) return <div className="p-8">Loading appointments...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading appointments</div>;

    const events: CalendarEvent[] = (rawAppointments || []).map(apt => ({
        id: apt.id,
        title: apt.service?.name || "Bloqueio",
        startTime: new Date(apt.startTime),
        endTime: new Date(apt.endTime),
        status: apt.status,
        professionalId: apt.professional?.id,
        professionalName: apt.professional?.fullName,
        customerName: apt.customer?.fullName
    }));

    const swimlanes = isOwner && professionals ? professionals.map((p: any) => ({
        id: p.id,
        name: p.fullName
    })) : undefined;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('appointments') || 'Agendamentos'}</h1>
                    <p className="text-gray-500 text-sm mt-1">Gerencie a sua agenda de trabalho</p>
                </div>
                <div className="space-x-2 flex">
                    <BlockTimeModal
                        professionals={swimlanes}
                        defaultProfessionalId={myProfile?.id}
                    />
                    <Button onClick={() => window.location.href = '/admin/appointments/new'}>
                        Nova Reserva
                    </Button>
                </div>
            </div>

            <CalendarGrid
                events={events}
                swimlanes={swimlanes}
                onEventClick={(evt) => console.log('Clicked event', evt)}
                onDateClick={(date, professionalId) => {
                    // Navigate to creation modal or page with pre-filled date & prof
                    let url = `/admin/appointments/new?date=${date.toISOString()}`;
                    if (professionalId) url += `&professional=${professionalId}`;
                    window.location.href = url;
                }}
            />
        </div>
    );
}
