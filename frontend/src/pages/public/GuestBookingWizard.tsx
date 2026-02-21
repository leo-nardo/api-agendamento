import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface GuestBookingWizardProps {
    companyId: string;
}

export default function GuestBookingWizard({ companyId }: GuestBookingWizardProps) {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Guest details
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // Password setup details
    const [guestPassword, setGuestPassword] = useState('');
    const [passwordSetupComplete, setPasswordSetupComplete] = useState(false);

    // Queries without JWT
    const { data: services } = useQuery<Service[]>({
        queryKey: ['publicServices', companyId],
        queryFn: async () => (await api.get(`/public/${companyId}/services`)).data,
    });

    const { data: professionals } = useQuery<Professional[]>({
        queryKey: ['publicProfessionals', companyId],
        queryFn: async () => (await api.get(`/public/${companyId}/professionals`)).data,
    });

    const { data: slots, isLoading: isLoadingSlots } = useQuery<string[]>({
        queryKey: ['publicSlots', companyId, selectedProfessional?.id, selectedDate, selectedService?.id],
        queryFn: async () => {
            if (!selectedDate || !selectedProfessional || !selectedService) return [];
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const response = await api.get(`/public/${companyId}/availability/slots?professionalId=${selectedProfessional.id}&date=${dateStr}&serviceId=${selectedService.id}`);
            return response.data;
        },
        enabled: !!selectedDate && !!selectedProfessional && !!selectedService
    });

    const createGuestAppointmentMutation = useMutation({
        mutationFn: async () => {
            if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) return;

            const [hours, minutes] = selectedTime.split(':').map(Number);
            const startTime = new Date(selectedDate);
            startTime.setHours(hours, minutes, 0, 0);

            // Timezone offset logic might be needed here based on how the backend parses dates,
            // but for simplicity we keep it as local iso string which backend handles.

            return api.post(`/public/${companyId}/appointments/guest`, {
                professionalId: selectedProfessional.id,
                serviceId: selectedService.id,
                customerName,
                customerEmail,
                customerPhone,
                appointmentTime: startTime.toISOString()
            });
        },
        onSuccess: () => {
            toast.success("Agendamento criado com sucesso!");
            setStep(6); // Move to Success Screen
        },
        onError: () => {
            toast.error("Falha ao criar o agendamento.");
        }
    });

    const registerGuestMutation = useMutation({
        mutationFn: async () => {
            return api.post(`/public/${companyId}/customers/register`, {
                email: customerEmail,
                password: guestPassword
            });
        },
        onSuccess: () => {
            toast.success("Senha cadastrada com sucesso! Você agora tem uma conta.");
            setPasswordSetupComplete(true);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Erro ao cadastrar senha. Talvez o e-mail já possua conta.");
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
                                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 flex flex-col justify-center items-center text-center ${selectedService?.id === service.id ? 'border-primary ring-2 ring-primary bg-blue-50' : 'bg-white'}`}
                                onClick={() => setSelectedService(service)}
                            >
                                <span className="font-semibold text-lg">{service.name}</span>
                                <span className="text-gray-500 mt-2">{service.durationMinutes} min - R$ {service.price.toFixed(2)}</span>
                            </div>
                        ))}
                        {services?.length === 0 && <p className="text-gray-500">Nenhum serviço disponível.</p>}
                    </div>
                );
            case 2: // Select Professional
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        {professionals?.map(prof => (
                            <div
                                key={prof.id}
                                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 flex items-center justify-center text-center ${selectedProfessional?.id === prof.id ? 'border-primary ring-2 ring-primary bg-blue-50' : 'bg-white'}`}
                                onClick={() => setSelectedProfessional(prof)}
                            >
                                <span className="font-semibold text-lg">{prof.name}</span>
                            </div>
                        ))}
                    </div>
                );
            case 3: // Select Date & Time
                return (
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="border rounded-xl p-4 bg-white shadow-sm flex-1 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold mb-4 text-gray-700">Horários disponíveis para {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}</h3>
                            {isLoadingSlots ? <p className="text-gray-500 animate-pulse">Carregando horários...</p> : (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots?.map(slot => (
                                        <Button
                                            key={slot}
                                            variant={selectedTime === slot ? "default" : "outline"}
                                            onClick={() => setSelectedTime(slot)}
                                            size="sm"
                                            className="w-full font-medium"
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                    {slots?.length === 0 && <p className="text-gray-500 col-span-3 text-sm">Nenhum horário disponível nesta data.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4: // Guest Details
                return (
                    <div className="space-y-4 max-w-sm mx-auto">
                        <div className="space-y-2">
                            <Label htmlFor="guestName">Seu Nome Completo</Label>
                            <Input
                                id="guestName"
                                placeholder="João Silva"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guestEmail">Seu E-mail</Label>
                            <Input
                                id="guestEmail"
                                type="email"
                                placeholder="joao@email.com"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guestPhone">Seu Telefone/WhatsApp</Label>
                            <Input
                                id="guestPhone"
                                placeholder="(11) 99999-9999"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 5: // Confirmation Summary
                return (
                    <div className="space-y-6">
                        <div className="p-6 bg-blue-50 rounded-xl space-y-3 text-gray-800 border border-blue-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-blue-900 border-b border-blue-200 pb-2">Resumo do Agendamento</h3>
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Serviço:</span>
                                <span className="font-semibold">{selectedService?.name}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Profissional:</span>
                                <span className="font-semibold">{selectedProfessional?.name}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Data e Hora:</span>
                                <span className="font-semibold">{selectedDate && format(selectedDate, 'dd/MM/yyyy')} às {selectedTime}</span>
                            </p>
                            <div className="border-t border-blue-200 pt-3 mt-3">
                                <p className="flex justify-between">
                                    <span className="font-medium text-gray-600">Cliente:</span>
                                    <span className="font-semibold">{customerName}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 6: // Success screen with Post-Booking upsell
                return (
                    <div className="text-center space-y-6 py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            ✓
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Agendamento Confirmado!</h2>
                        <p className="text-gray-600 max-w-sm mx-auto">
                            Tudo certo, {customerName}! Te esperamos no dia {selectedDate && format(selectedDate, 'dd/MM/yyyy')} às {selectedTime}.
                        </p>

                        {!passwordSetupComplete && (
                            <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 text-left">
                                <h3 className="font-semibold text-lg mb-2 text-center">Quer facilitar os próximos agendamentos?</h3>
                                <p className="text-sm text-gray-500 mb-4 text-center">
                                    Crie uma senha rápida agora para ver seu histórico e não precisar preencher seus dados na próxima vez.
                                </p>
                                <div className="space-y-4 max-w-xs mx-auto">
                                    <Input
                                        type="password"
                                        placeholder="Digite uma nova senha"
                                        value={guestPassword}
                                        onChange={(e) => setGuestPassword(e.target.value)}
                                    />
                                    <Button
                                        variant="outline"
                                        className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                                        onClick={() => registerGuestMutation.mutate()}
                                        disabled={!guestPassword || registerGuestMutation.isPending}
                                    >
                                        {registerGuestMutation.isPending ? 'Salvando...' : 'Definir Senha Agora'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Button variant="ghost" className="mt-4 text-gray-500" onClick={() => window.location.reload()}>
                            Fazer novo agendamento
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    const nextStep = () => {
        if (step === 1 && selectedService) setStep(2);
        if (step === 2 && selectedProfessional) setStep(3);
        if (step === 3 && selectedDate && selectedTime) setStep(4);
        if (step === 4 && customerName && customerEmail && customerPhone) setStep(5);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <Card className="max-w-xl mx-auto border-none shadow-lg mt-8 mb-8 overflow-hidden rounded-2xl">
            {step < 6 && (
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <CardTitle className="text-2xl">Agende seu horário</CardTitle>
                    <CardDescription className="text-blue-100 mt-1 uppercase tracking-wider text-xs font-semibold">Passo {step} de 5</CardDescription>
                </CardHeader>
            )}
            <CardContent className="pt-6">
                {renderStepContent()}
            </CardContent>
            {step < 6 && (
                <CardFooter className="flex justify-between border-t bg-gray-50/50 p-6">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1} className="w-24 border-gray-300 text-gray-600">
                        Voltar
                    </Button>

                    {step < 5 ? (
                        <Button className="w-24 bg-primary text-white" onClick={nextStep} disabled={
                            (step === 1 && !selectedService) ||
                            (step === 2 && !selectedProfessional) ||
                            (step === 3 && (!selectedDate || !selectedTime)) ||
                            (step === 4 && (!customerName || !customerEmail || !customerPhone))
                        }>
                            Avançar
                        </Button>
                    ) : (
                        <Button className="bg-green-600 text-white hover:bg-green-700 px-6 font-semibold" onClick={() => createGuestAppointmentMutation.mutate()} disabled={createGuestAppointmentMutation.isPending}>
                            {createGuestAppointmentMutation.isPending ? 'Confirmando...' : 'Confirmar Agendamento'}
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
