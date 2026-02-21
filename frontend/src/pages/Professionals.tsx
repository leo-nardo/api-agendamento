import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Professional {
    id: string;
    userAccount: {
        fullName: string;
        email: string;
        phoneNumber: string;
    };
    active: boolean;
}

export default function Professionals() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newProfessional, setNewProfessional] = useState({ fullName: '', email: '', phoneNumber: '' });

    const { data: professionals, isLoading, error } = useQuery<Professional[]>({
        queryKey: ['professionals'],
        queryFn: async () => {
            const response = await api.get('/professionals');
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (prof: any) => {
            return api.post('/professionals', prof);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
            setIsCreating(false);
            setNewProfessional({ fullName: '', email: '', phoneNumber: '' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/professionals/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newProfessional);
    };

    if (isLoading) return <div className="p-8">Loading professionals...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading professionals</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('professionals')}</h1>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Professional
                </Button>
            </div>

            {isCreating && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>New Professional</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newProfessional.fullName}
                                        onChange={(e) => setNewProfessional({ ...newProfessional, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newProfessional.email}
                                        onChange={(e) => setNewProfessional({ ...newProfessional, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={newProfessional.phoneNumber}
                                        onChange={(e) => setNewProfessional({ ...newProfessional, phoneNumber: e.target.value })}
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {professionals?.map((prof) => (
                    <Card key={prof.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">
                                {prof.userAccount?.fullName || 'Sem Nome'}
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteMutation.mutate(prof.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">{prof.userAccount?.email}</p>
                            <p className="text-sm text-gray-500">{prof.userAccount?.phoneNumber}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
