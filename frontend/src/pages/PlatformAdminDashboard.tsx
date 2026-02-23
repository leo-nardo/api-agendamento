import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Power, PowerOff, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface AdminCompanyResponse {
    id: string;
    legalName: string;
    tradeName: string;
    slug: string;
    ownerEmail: string;
    ownerName: string;
    active: boolean;
    createdAt: string;
}

const createSchema = z.object({
    companyName: z.string().min(2, "Nome da empresa é obrigatório"),
    taxId: z.string().min(11, "CNPJ/CPF inválido"),
    fullName: z.string().min(2, "Nome do proprietário obrigatório"),
    email: z.string().email("E-mail inválido"),
    phoneNumber: z.string().min(8, "Telefone inválido"),
});

const editSchema = z.object({
    legalName: z.string().min(2, "Razão Social é obrigatória"),
    tradeName: z.string().optional(),
    slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
});

export default function PlatformAdminDashboard() {
    const queryClient = useQueryClient();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<AdminCompanyResponse | null>(null);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string, password: string, url: string } | null>(null);

    const { data: companies, isLoading, error } = useQuery<AdminCompanyResponse[]>({
        queryKey: ['platform-companies'],
        queryFn: async () => {
            const response = await api.get('/admin/companies');
            return response.data;
        },
    });

    const createForm = useForm<z.infer<typeof createSchema>>({
        resolver: zodResolver(createSchema),
        defaultValues: { companyName: '', taxId: '', fullName: '', email: '', phoneNumber: '' }
    });

    const editForm = useForm<z.infer<typeof editSchema>>({
        resolver: zodResolver(editSchema),
        defaultValues: { legalName: '', tradeName: '', slug: '' }
    });

    const onSubmitCreate = (data: z.infer<typeof createSchema>) => {
        const generatedPassword = Array(3).fill(0).map(() => Math.random().toString(36).slice(2, 6)).join('-') + '!A' + Math.floor(Math.random() * 9);
        const payload = { ...data, password: generatedPassword };
        createMutation.mutate(payload as any);
    };

    const createMutation = useMutation({
        mutationFn: async (data: any) => api.post('/register', data),
        onSuccess: (_data: any, variables: any) => {
            queryClient.invalidateQueries({ queryKey: ['platform-companies'] });
            toast.success("Empresa cadastrada com sucesso!");
            setIsCreateOpen(false);
            createForm.reset();
            setCreatedCredentials({
                email: variables.email,
                password: variables.password,
                url: window.location.origin + '/admin/login'
            });
        },
        onError: () => toast.error("Erro ao cadastrar empresa. Verifique os dados e o e-mail (que deve ser único).")
    });

    const editMutation = useMutation({
        mutationFn: async (data: z.infer<typeof editSchema>) => api.put(`/admin/companies/${selectedCompany?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-companies'] });
            toast.success("Dados da empresa atualizados!");
            setIsEditOpen(false);
        },
        onError: () => toast.error("Erro ao atualizar empresa.")
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/admin/companies/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-companies'] });
            toast.success("Empresa excluída com sucesso.");
            setIsDeleteOpen(false);
        },
        onError: () => toast.error("Erro ao excluir empresa. Verifique integridade dos dados.")
    });

    const toggleMutation = useMutation({
        mutationFn: async (id: string) => api.put(`/admin/companies/${id}/toggle-status`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-companies'] });
            toast.success("Status atualizado!");
        },
        onError: () => toast.error("Erro ao atualizar status.")
    });

    const openEdit = (company: AdminCompanyResponse) => {
        setSelectedCompany(company);
        editForm.reset({
            legalName: company.legalName,
            tradeName: company.tradeName || '',
            slug: company.slug
        });
        setIsEditOpen(true);
    };

    const openDelete = (company: AdminCompanyResponse) => {
        setSelectedCompany(company);
        setIsDeleteOpen(true);
    };

    if (isLoading) return <div className="p-8">Carregando empresas da plataforma...</div>;
    if (error) return <div className="p-8 text-red-500">Erro ao carregar dados da plataforma. Verifique suas credenciais.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Admin</h1>
                    <p className="text-gray-500 text-sm mt-1">Gerencie os tenants/empresas cadastrados no SaaS.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-primary text-white">
                    <Plus className="mr-2 h-4 w-4" /> Nova Empresa
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Empresas Cadastradas</CardTitle>
                    <CardDescription>Visão global de todos os clientes B2B operando na plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Empresa</th>
                                    <th scope="col" className="px-6 py-3">Slug (URL)</th>
                                    <th scope="col" className="px-6 py-3">Responsável</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies?.map(company => (
                                    <tr key={company.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-gray-900">{company.tradeName || company.legalName}</div>
                                                <div className="text-xs text-gray-400">{company.legalName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{company.slug}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{company.ownerName || 'Não Atribuído'}</div>
                                                <div className="text-xs text-gray-500">{company.ownerEmail || '—'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={company.active ? 'default' : 'destructive'} className={company.active ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                {company.active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            <Button variant="outline" size="icon" onClick={() => openEdit(company)} className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => toggleMutation.mutate(company.id)}
                                                disabled={toggleMutation.isPending}
                                                className={`h-8 w-8 ${!company.active ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-orange-600 border-orange-200 hover:bg-orange-50'}`}
                                            >
                                                {company.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => openDelete(company)} className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!companies || companies.length === 0) && (
                            <div className="text-center py-8 text-gray-500">Nenhuma empresa encontrada na plataforma.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create Company Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
                        <DialogDescription>Preencha os dados básicos e crie o usuário administrador inicial desta empresa.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
                        <div className="space-y-1">
                            <Label>Nome da Empresa (Razão Social) *</Label>
                            <Input {...createForm.register('companyName')} />
                            <p className="text-xs text-red-500">{createForm.formState.errors.companyName?.message}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>CNPJ/CPF *</Label>
                            <Input {...createForm.register('taxId')} />
                            <p className="text-xs text-red-500">{createForm.formState.errors.taxId?.message}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Nome do Proprietário *</Label>
                            <Input {...createForm.register('fullName')} />
                            <p className="text-xs text-red-500">{createForm.formState.errors.fullName?.message}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>E-mail (Login do Proprietário) *</Label>
                            <Input type="email" {...createForm.register('email')} />
                            <p className="text-xs text-red-500">{createForm.formState.errors.email?.message}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Telefone *</Label>
                            <Input {...createForm.register('phoneNumber')} />
                            <p className="text-xs text-red-500">{createForm.formState.errors.phoneNumber?.message}</p>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createMutation.isPending}>Cadastrar e Gerar Acesso</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Company Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Empresa</DialogTitle>
                        <DialogDescription>Edite as informações cadastrais desta empresa.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={editForm.handleSubmit(data => editMutation.mutate(data))} className="space-y-4">
                        <div className="space-y-1">
                            <Label>Razão Social *</Label>
                            <Input {...editForm.register('legalName')} />
                            <p className="text-xs text-red-500">{editForm.formState.errors.legalName?.message}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Nome Fantasia</Label>
                            <Input {...editForm.register('tradeName')} />
                        </div>
                        <div className="space-y-1">
                            <Label>Slug da URL (ex: minha-empresa)</Label>
                            <Input {...editForm.register('slug')} />
                            <p className="text-xs text-red-500">{editForm.formState.errors.slug?.message}</p>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={editMutation.isPending}>Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Company Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Atenção: Exclusão de Empresa</DialogTitle>
                        <DialogDescription>
                            Você está prestes a excluir permanentemente a empresa <strong>{selectedCompany?.legalName}</strong>.
                            Isto apagará também todos os apontamentos, clientes, serviços e usuários associados.
                            Esta ação é irreversível.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => selectedCompany && deleteMutation.mutate(selectedCompany.id)}
                        >
                            Excluir Definitivamente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Credentials Modal */}
            <Dialog open={!!createdCredentials} onOpenChange={(open) => { if (!open) setCreatedCredentials(null); }}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-green-600 flex items-center gap-2 text-xl">
                            🎉 Onboarding Finalizado!
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            A empresa foi cadastrada. Copie as credenciais abaixo e envie para o proprietário poder acessar o painel de imediato:
                        </DialogDescription>
                    </DialogHeader>
                    {createdCredentials && (
                        <div className="space-y-4 py-4">
                            <div className="bg-gray-100 p-4 rounded-md text-sm font-mono border border-gray-200 shadow-inner space-y-2">
                                <p><strong>Endereço do Painel:</strong> <br /><span className="text-blue-600">{createdCredentials.url}</span></p>
                                <p><strong>E-mail de Acesso:</strong> <br />{createdCredentials.email}</p>
                                <p><strong>Senha Inicial Gerada:</strong> <br /><span className="bg-gray-200 px-1 py-0.5 rounded text-red-600 font-bold">{createdCredentials.password}</span></p>
                            </div>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white shadow"
                                size="lg"
                                onClick={() => {
                                    const text = `🎉 Olá! O seu sistema de agendamento está pronto e operando.\n\n🌐 *Acesse o seu Painel:*\n${createdCredentials.url}\n\n📧 *Login:* ${createdCredentials.email}\n🔑 *Senha Inicial:* ${createdCredentials.password}\n\n(Recomendamos fortemente deletar esta mensagem e alterar sua senha de imediato no primeiro acesso!)`;
                                    navigator.clipboard.writeText(text);
                                    toast.success("Mensagem copiada! Pressione CTRL+V no WhatsApp.");
                                }}
                            >
                                Copiar Mensagem Pronta p/ WhatsApp
                            </Button>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreatedCredentials(null)}>Fechar Painel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
