import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { maskCpfCnpj, maskPhone } from '@/utils/masks';
import { validateCNPJ, validateCPF } from '@/utils/validators';

const registerSchema = z.object({
    companyName: z.string().min(2, "Razão Social é obrigatória"),
    taxId: z.string().refine((val) => {
        const clean = val.replace(/\D/g, '');
        return clean.length === 11 ? validateCPF(clean) : validateCNPJ(clean);
    }, "CPF ou CNPJ inválido"),
    email: z.string().email("Email inválido"),
    fullName: z.string().min(2, "Nome do proprietário é obrigatório"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres")
        .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
        .regex(/[0-9]/, "Senha deve conter pelo menos um número")
        .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
    phoneNumber: z.string().min(10, "Telefone inválido"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });

    const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('taxId', maskCpfCnpj(e.target.value), { shouldValidate: true });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('phoneNumber', maskPhone(e.target.value), { shouldValidate: true });
    };

    const onSubmit = async (data: RegisterValues) => {
        setError(null);
        try {
            await api.post('/register', {
                companyName: data.companyName,
                taxId: data.taxId.replace(/\D/g, ''),
                email: data.email,
                fullName: data.fullName,
                password: data.password,
                phoneNumber: data.phoneNumber.replace(/\D/g, '')
            });

            toast.success("Sucesso!", {
                description: "Registro realizado com sucesso! Você será redirecionado para o login."
            });
            navigate('/admin/login');

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Falha no registro. Verifique os dados.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t('register')}</CardTitle>
                    <CardDescription>Crie sua conta empresarial.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="legalName">Nome da Empresa / Razão Social</Label>
                            <Input id="legalName" {...register('companyName')} placeholder="Minha Barbearia Show" />
                            {errors.companyName && <span className="text-sm text-red-500">{errors.companyName.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taxId">CPF ou CNPJ</Label>
                            <Input
                                id="taxId"
                                {...register('taxId')}
                                onChange={handleTaxIdChange}
                                placeholder="000.000.000-00"
                            />
                            {errors.taxId && <span className="text-sm text-red-500">{errors.taxId.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo do Dono</Label>
                            <Input id="name" {...register('fullName')} placeholder="Seu Nome Completo" />
                            {errors.fullName && <span className="text-sm text-red-500">{errors.fullName.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input id="email" type="email" {...register('email')} placeholder="seu@email.com" />
                            {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Telefone / WhatsApp</Label>
                            <Input
                                id="phoneNumber"
                                {...register('phoneNumber')}
                                onChange={handlePhoneChange}
                                placeholder="(11) 99999-9999"
                            />
                            {errors.phoneNumber && <span className="text-sm text-red-500">{errors.phoneNumber.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t('password')}</Label>
                            <Input id="password" type="password" {...register('password')} placeholder="Senha forte" />
                            {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
                        </div>

                        {error && <div className="text-sm text-red-500">{error}</div>}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Registrando...' : t('register')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link to="/admin/login" className="text-sm text-blue-600 hover:underline">
                        Já tem uma conta? Entrar
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
