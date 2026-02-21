import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Copy, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
    const { t } = useTranslation();
    const { slug, companyName } = useAuth();

    const storefrontUrl = `${window.location.origin}/${slug || 'loja'}`;

    const handleCopyLink = () => {
        if (!slug) {
            toast.error("Erro: Link da loja não encontrado. Faça login novamente.");
            return;
        }
        navigator.clipboard.writeText(storefrontUrl);
        toast.success("Link da loja copiado para a área de transferência!");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    {companyName ? `Painel - ${companyName}` : (t('dashboard') || 'Painel de Controle')}
                </h1>
                <Button onClick={handleCopyLink} variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10">
                    <Copy className="h-4 w-4" />
                    Copiar Link da Loja
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Link Público <LinkIcon className="inline h-4 w-4 text-muted-foreground ml-2" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-semibold truncate text-primary">
                            <a href={storefrontUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                /{slug || '...'}
                            </a>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Compartilhe este link com seus clientes
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
