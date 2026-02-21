import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Customer {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

export default function Customers() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ fullName: '', email: '', phoneNumber: '' });

    const { data: customers, isLoading, error } = useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await api.get('/customers');
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (customer: any) => {
            return api.post('/customers', customer);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setIsCreating(false);
            setNewCustomer({ fullName: '', email: '', phoneNumber: '' });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newCustomer);
    };

    if (isLoading) return <div className="p-8">Loading customers...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading customers</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('customers')}</h1>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            {isCreating && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>New Customer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newCustomer.fullName}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newCustomer.email}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={newCustomer.phoneNumber}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
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
                {customers?.map((customer) => (
                    <Card key={customer.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">
                                {customer.fullName || 'Sem Nome'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                            <p className="text-sm text-gray-500">{customer.phoneNumber}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
