'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, LogIn } from 'lucide-react';
import { getDefaultRedirect } from '@/lib/roles';
import { toast } from 'sonner';
import { musicalButton } from '@/lib/musical-theme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Email ou senha inválidos');
        return;
      }

      // Get the updated session to get user role
      const session = await getSession();
      if (session?.user) {
        const redirectUrl = getDefaultRedirect(session.user.role);
        router.push(redirectUrl);
        toast.success('Login realizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
      {/* Conteúdo */}
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header Musical */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3 shadow-md">
                <Music className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-semibold text-slate-800 mb-1">Ensaios Igreja</h1>
            <p className="text-slate-500">Portal Musical dos Ensaios</p>
          </div>
          
          {/* Card de Login */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-slate-800 flex items-center justify-center gap-2">
                <LogIn className="h-6 w-6 text-pink-600" />
                Acesso ao Sistema
              </CardTitle>
              <CardDescription className="text-slate-500">
                Digite suas credenciais para entrar no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="focus:border-pink-500 focus:ring-pink-500"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="focus:border-pink-500 focus:ring-pink-500"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full py-3 text-lg font-semibold ${musicalButton('primary')} transform hover:scale-[1.01] transition-transform`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Entrar no Sistema
                    </>
                  )}
                </Button>
              </form>
              
              {/* Contas de Teste */}
              <div className="mt-8 p-4 bg-slate-50 rounded-lg border">
                <p className="text-center font-semibold text-slate-800 mb-3">Contas de Demonstração</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Admin:</span>
                    <span>admin@demo.com / Admin@123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Usuário:</span>
                    <span>usuario@demo.com / Usuario@123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Adolescente:</span>
                    <span>adolescente1@demo.com / Adolescente@123</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <div className="text-center">
            <p className="text-slate-500 text-sm">
              Sistema de Gestão Musical para Igrejas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}