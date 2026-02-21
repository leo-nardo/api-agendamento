import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next'; // Unused for now
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

// Types
interface Service {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
}

interface Professional {
    id: string;
    name: string;
}

interface Customer {
    id: string;
    name: string;
}

export default function NewAppointment() {
    // const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Queries
    const { data: services } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: async () => (await api.get('/services')).data,
    });

    const { data: professionals } = useQuery<Professional[]>({
        queryKey: ['professionals'],
        queryFn: async () => (await api.get('/professionals')).data,
    });

    const { data: customers } = useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async () => (await api.get('/customers')).data,
    });

    const { data: slots, isLoading: isLoadingSlots } = useQuery<string[]>({
        queryKey: ['slots', selectedProfessional?.id, selectedDate],
        queryFn: async () => {
            if (!selectedDate || !selectedProfessional) return [];
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const response = await api.get(`/availability/slots?professionalId=${selectedProfessional.id}&date=${dateStr}&serviceId=${selectedService?.id || ''}`);
            return response.data;
        },
        enabled: !!selectedDate && !!selectedProfessional
    });

    const createAppointmentMutation = useMutation({
        mutationFn: async () => {
            if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !selectedCustomer) return;

            const [hours, minutes] = selectedTime.split(':').map(Number);
            const startTime = new Date(selectedDate);
            startTime.setHours(hours, minutes);

            const endTime = new Date(startTime.getTime() + selectedService.durationMinutes * 60000);

            return api.post('/appointments', {
                professionalId: selectedProfessional.id,
                businessServiceId: selectedService.id,
                customerId: selectedCustomer.id,
                startDate: startTime.toISOString(),
                endDate: endTime.toISOString(),
                status: 'SCHEDULED'
            });
        },
        onSuccess: () => {
            toast.success("Agendamento criado com sucesso!");
            navigate('/appointments');
        },
        onError: () => {
            toast.error("Falha ao criar o agendamento.");
        }
    });

    // Render Steps
    const renderStepContent = () => {
        switch (step) {
            case 1: // Select Service
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        {services?.map(service => (
                            <div
                                key={service.id}
                                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 flex justify-between ${selectedService?.id === service.id ? 'border-primary ring-1 ring-primary' : ''}`}
                                onClick={() => setSelectedService(service)}
                            >
                                <span className="font-medium">{service.name}</span>
                                <span className="text-gray-500">{service.durationMinutes} min - ${service.price}</span>
                            </div>
                        ))}
                    </div>
                );
            case 2: // Select Professional
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        {professionals?.map(prof => (
                            <div
                                key={prof.id}
                                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 ${selectedProfessional?.id === prof.id ? 'border-primary ring-1 ring-primary' : ''}`}
                                onClick={() => setSelectedProfessional(prof)}
                            >
                                <span className="font-medium">{prof.name}</span>
                            </div>
                        ))}
                    </div>
                );
            case 3: // Select Customer
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        {customers?.map(cust => (
                            <div
                                key={cust.id}
                                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 ${selectedCustomer?.id === cust.id ? 'border-primary ring-1 ring-primary' : ''}`}
                                onClick={() => setSelectedCustomer(cust)}
                            >
                                <span className="font-medium">{cust.name}</span>
                            </div>
                        ))}
                    </div>
                );
            case 4: // Select Date & Time
                return (
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="border rounded p-4">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium mb-4">Available Time Slots for {selectedDate ? format(selectedDate, 'PPP') : ''}</h3>
                            {isLoadingSlots ? <p>Loading slots...</p> : (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots?.map(slot => (
                                        <Button
                                            key={slot}
                                            variant={selectedTime === slot ? "default" : "outline"}
                                            onClick={() => setSelectedTime(slot)}
                                            size="sm"
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                    {slots?.length === 0 && <p className="text-gray-500 col-span-3">No slots available.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 5: // Confirmation
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded space-y-2">
                            <p><strong>Service:</strong> {selectedService?.name}</p>
                            <p><strong>Professional:</strong> {selectedProfessional?.name}</p>
                            <p><strong>Customer:</strong> {selectedCustomer?.name}</p>
                            <p><strong>Date:</strong> {selectedDate && format(selectedDate, 'PPP')}</p>
                            <p><strong>Time:</strong> {selectedTime}</p>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    };

    const nextStep = () => {
        if (step === 1 && selectedService) setStep(2);
        if (step === 2 && selectedProfessional) setStep(3);
        if (step === 3 && selectedCustomer) setStep(4);
        if (step === 4 && selectedDate && selectedTime) setStep(5);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <Card className="max-w-3xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>New Appointment</CardTitle>
                <CardDescription>Step {step} of 5</CardDescription>
            </CardHeader>
            <CardContent>
                {renderStepContent()}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={step === 1}>Back</Button>

                {step < 5 ? (
                    <Button onClick={nextStep} disabled={
                        (step === 1 && !selectedService) ||
                        (step === 2 && !selectedProfessional) ||
                        (step === 3 && !selectedCustomer) ||
                        (step === 4 && (!selectedDate || !selectedTime))
                    }>
                        Next
                    </Button>
                ) : (
                    <Button onClick={() => createAppointmentMutation.mutate()} disabled={createAppointmentMutation.isPending}>
                        {createAppointmentMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
