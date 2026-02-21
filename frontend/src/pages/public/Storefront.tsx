import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GuestBookingWizard from './GuestBookingWizard';
import api from '@/api/axios';

interface CompanyDto {
    id: string;
    legalName: string;
    slug: string;
}

export default function Storefront() {
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();
    const isBooking = location.pathname.endsWith('/agendar');

    const { data: company, isLoading, isError } = useQuery<CompanyDto>({
        queryKey: ['companySlug', slug],
        queryFn: async () => {
            const res = await api.get(`/public/company/${slug}`);
            return res.data;
        },
        enabled: !!slug
    });

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center p-4">Carregando...</div>;
    }

    if (isError || !company) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-red-600">Página Não Encontrada</CardTitle>
                        <CardDescription>Não encontramos o estabelecimento para o link informado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link to="/admin/login">Acessar Painel</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isBooking) {
        return <GuestBookingWizard companyId={company.id} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Bem-vindo(a) a {company.legalName}</CardTitle>
                    <CardDescription>Aqui é a vitrine exclusiva deste estabelecimento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-gray-600">
                        Nossos serviços estão à sua disposição!
                    </p>
                    <Button asChild className="w-full">
                        <Link to={`/${slug}/agendar`}>Começar Agendamento</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
