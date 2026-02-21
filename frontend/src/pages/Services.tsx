import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BusinessService {
    id: string; // UUID
    name: string;
    durationMinutes: number;
    price: number;
    active: boolean;
}

export default function Services() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newService, setNewService] = useState({ name: '', durationMinutes: 30, price: 0 });

    const { data: services, isLoading, error } = useQuery<BusinessService[]>({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await api.get('/services');
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (service: any) => {
            return api.post('/services', service);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            setIsCreating(false);
            setNewService({ name: '', durationMinutes: 30, price: 0 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/services/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newService);
    };

    if (isLoading) return <div className="p-8">Loading services...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading services</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('services')}</h1>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Service
                </Button>
            </div>

            {isCreating && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>New Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (min)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={newService.durationMinutes}
                                        onChange={(e) => setNewService({ ...newService, durationMinutes: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={newService.price}
                                        onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {services?.map((service) => (
                    <Card key={service.id} className="flex flex-row items-center justify-between p-4 shadow-sm">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                {service.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                {service.durationMinutes} min • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteMutation.mutate(service.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
