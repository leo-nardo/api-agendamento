import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface WorkingHour {
    dayOfWeek: number;
    isOpen: boolean;
    start: string;
    end: string;
}

interface ProfessionalResponse {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    workingHours?: WorkingHour[] | any;
}

const defaultHours: WorkingHour[] = [
    { dayOfWeek: 1, isOpen: true, start: "09:00", end: "18:00" }, // Monday
    { dayOfWeek: 2, isOpen: true, start: "09:00", end: "18:00" }, // Tuesday
    { dayOfWeek: 3, isOpen: true, start: "09:00", end: "18:00" }, // Wednesday
    { dayOfWeek: 4, isOpen: true, start: "09:00", end: "18:00" }, // Thursday
    { dayOfWeek: 5, isOpen: true, start: "09:00", end: "18:00" }, // Friday
    { dayOfWeek: 6, isOpen: false, start: "09:00", end: "13:00" }, // Saturday
    { dayOfWeek: 0, isOpen: false, start: "09:00", end: "13:00" }, // Sunday
];

const daysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function ProfessionalProfile() {
    const queryClient = useQueryClient();
    const [hours, setHours] = useState<WorkingHour[]>(defaultHours);

    const { data: profile, isLoading } = useQuery<ProfessionalResponse>({
        queryKey: ['my-profile'],
        queryFn: async () => {
            const response = await api.get('/professionals/me');
            return response.data;
        }
    });

    useEffect(() => {
        if (profile?.workingHours && Array.isArray(profile.workingHours) && profile.workingHours.length > 0) {
            const fetchedDirs = profile.workingHours as WorkingHour[];
            const merged = defaultHours.map(def => {
                const found = fetchedDirs.find(f => f.dayOfWeek === def.dayOfWeek);
                return found || def;
            });
            setHours(merged);
        }
    }, [profile]);

    const updateMutation = useMutation({
        mutationFn: async (updatedHours: WorkingHour[]) => {
            return api.put('/professionals/me/working-hours', updatedHours);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
            toast.success("Horários atualizados com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao salvar os horários.");
        }
    });

    const handleHourChange = (dayOfWeek: number, field: keyof WorkingHour, value: any) => {
        setHours(prev => prev.map(day => day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day));
    };

    const handleSave = () => {
        updateMutation.mutate(hours);
    };

    if (isLoading) return <div className="p-8">Carregando seu perfil...</div>;

    return (
        <div className="space-y-6 max-w-4xl pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
                <p className="text-gray-500 text-sm mt-1">Gerencie seus dados e horários de atendimento.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                    <CardDescription>Informações do seu usuário no sistema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input value={profile?.fullName || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={profile?.email || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input value={profile?.phoneNumber || ''} disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Horários de Trabalho</CardTitle>
                    <CardDescription>Defina os horários padrão semanais em que você recebe agendamentos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {hours.map((day) => (
                            <div key={day.dayOfWeek} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                                <div className="w-32 flex items-center justify-between">
                                    <Label className="font-semibold">{daysMap[day.dayOfWeek]}</Label>
                                    <Switch
                                        checked={day.isOpen}
                                        onCheckedChange={(val: boolean) => handleHourChange(day.dayOfWeek, 'isOpen', val)}
                                    />
                                </div>

                                {day.isOpen ? (
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-gray-500">Das</Label>
                                            <Input
                                                type="time"
                                                value={day.start}
                                                onChange={(e) => handleHourChange(day.dayOfWeek, 'start', e.target.value)}
                                                className="w-24"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-gray-500">Até</Label>
                                            <Input
                                                type="time"
                                                value={day.end}
                                                onChange={(e) => handleHourChange(day.dayOfWeek, 'end', e.target.value)}
                                                className="w-24"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 italic text-sm flex-1">Sem expediente</div>
                                )}
                            </div>
                        ))}

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Salvando...' : 'Salvar Horários'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
