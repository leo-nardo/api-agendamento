import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(1, { message: "Senha é obrigatória" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginValues) => {
        setError(null);
        try {
            const res = await api.post('/login', {
                username: data.email,
                password: data.password
            });

            // Backend now returns companyId, role, slug, and companyName in response
            const { token, companyId, slug, companyName } = res.data;

            if (!companyId) {
                setError("Sua conta não tem uma empresa vinculada. Contate o suporte.");
                return;
            }

            login(token, companyId, slug, companyName);
            navigate('/admin');
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setError("Credenciais inválidas.");
            } else {
                setError("Falha ao entrar. Tente novamente.");
            }
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t('login')}</CardTitle>
                    <CardDescription>Entre com suas credenciais para o Painel Administrativo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
                            {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('password')}</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
                        </div>

                        {error && <div className="text-sm text-red-500">{error}</div>}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Entrando...' : t('login')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link to="/admin/register" className="text-sm text-blue-600 hover:underline">
                        Não tem uma conta? Registre-se
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
