import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface CompanyResponse {
    id: string;
    tradeName?: string;
    legalName?: string;
    slug: string;
    taxId?: string;
    settingsJson?: string;
}

export default function Settings() {
    const queryClient = useQueryClient();
    const { login, token, companyId } = useAuth(); // We might need to refresh context if slug changes

    const [formData, setFormData] = useState({
        tradeName: '',
        legalName: '',
        slug: '',
        taxId: ''
    });

    const { data: company, isLoading } = useQuery<CompanyResponse>({
        queryKey: ['my-company'],
        queryFn: async () => {
            const response = await api.get('/owner/company');
            return response.data;
        }
    });

    useEffect(() => {
        if (company) {
            setFormData({
                tradeName: company.tradeName || company.legalName || '',
                legalName: company.legalName || '',
                slug: company.slug || '',
                taxId: company.taxId || ''
            });
        }
    }, [company]);

    const updateMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return api.put('/owner/company', data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['my-company'] });
            toast.success("Configurações salvas com sucesso!");

            // If slug or name changed, update the auth context locally
            if (token && companyId) {
                login(token, companyId, response.data.slug, response.data.tradeName || response.data.legalName);
            }
        },
        onError: () => {
            toast.error("Erro ao salvar as configurações.");
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) return <div className="p-8">Carregando configurações...</div>;

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações do Estabelecimento</h1>
                <p className="text-gray-500 text-sm mt-1">Gerencie os dados públicos da sua barbearia/clínica e a URL de agendamento.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados Básicos</CardTitle>
                    <CardDescription>Estes dados serão apresentados aos seus clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tradeName">Nome Fantasia (Apresentação)</Label>
                                <Input
                                    id="tradeName"
                                    name="tradeName"
                                    value={formData.tradeName}
                                    onChange={handleChange}
                                    placeholder="Ex: Barbearia do João"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="legalName">Razão Social</Label>
                                <Input
                                    id="legalName"
                                    name="legalName"
                                    value={formData.legalName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="taxId">CNPJ / CPF</Label>
                                <Input
                                    id="taxId"
                                    name="taxId"
                                    value={formData.taxId}
                                    onChange={handleChange}
                                    placeholder="00.000.000/0001-00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug da URL (Link público)</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="barbearia-do-joao"
                                />
                                <p className="text-xs text-gray-400 mt-1">Seu link será: agendamentopro.com/<b>{formData.slug || 'slug'}</b></p>
                            </div>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
