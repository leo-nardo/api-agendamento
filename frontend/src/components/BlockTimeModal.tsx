import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BlockTimeModalProps {
    professionals?: { id: string, name: string }[];
    defaultProfessionalId?: string;
}

export function BlockTimeModal({ professionals, defaultProfessionalId }: BlockTimeModalProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    // Auto-select if there's a default, otherwise use the first professional
    const [professionalId, setProfessionalId] = useState<string>(
        defaultProfessionalId || (professionals && professionals.length > 0 ? professionals[0].id : '')
    );
    const [date, setDate] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post('/appointments', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast.success("Bloqueio de agenda criado com sucesso!");
            setOpen(false);
            // Reset state
            setDate('');
            setStartTime('');
            setEndTime('');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Erro ao criar bloqueio");
        }
    });

    const handleSave = () => {
        const idToUse = professionalId || defaultProfessionalId;
        if (!idToUse || !date || !startTime || !endTime) {
            toast.error("Preencha todos os campos.");
            return;
        }

        const startDateTime = `${date}T${startTime}:00`;
        const endDateTime = `${date}T${endTime}:00`;

        createMutation.mutate({
            professionalId: idToUse,
            businessServiceId: null, // Signals this is a block
            customerId: null,
            startDate: startDateTime,
            endDate: endDateTime
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Bloquear Horário</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bloquear Horário</DialogTitle>
                    <DialogDescription>
                        Crie um bloqueio na agenda para impedir novos agendamentos neste período.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {professionals && professionals.length > 0 && !defaultProfessionalId && (
                        <div className="space-y-2">
                            <Label>Profissional</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={professionalId}
                                onChange={(e) => setProfessionalId(e.target.value)}
                            >
                                <option value="" disabled>Selecione um profissional</option>
                                {professionals.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Início (HH:mm)</Label>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fim (HH:mm)</Label>
                            <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={createMutation.isPending} variant="destructive">
                        {createMutation.isPending ? 'Salvando...' : 'Confirmar Bloqueio'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
