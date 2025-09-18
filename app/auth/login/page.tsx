'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, LogIn, Headphones } from 'lucide-react';
import { getDefaultRedirect } from '@/lib/roles';
import { toast } from 'sonner';
import { musicalButton, musicalCard } from '@/lib/musical-theme';

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Musical Épico */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&h=1080&fit=crop&crop=center')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-pink-900/95"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        {/* Efeitos visuais animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          {/* Ondas musicais */}
          <div className="absolute top-10 right-10 animate-bounce delay-300">
            <Headphones className="h-8 w-8 text-pink-400/60" />
          </div>
          <div className="absolute bottom-10 left-10 animate-bounce delay-700">
            <Music className="h-10 w-10 text-purple-400/60" />
          </div>
        </div>
      </div>
      
      {/* Conteúdo */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header Musical */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30">
                  <Music className="h-12 w-12 text-pink-400" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl mb-4">
              🎵 Ensaios Igreja
            </h1>
            <p className="text-lg text-gray-200 font-medium drop-shadow-lg">
              Portal Musical dos Ensaios
            </p>
            <p className="text-sm text-gray-300 mt-2">
              Faça login para acessar o sistema de ensaios
            </p>
          </div>
          
          {/* Card de Login */}
          <Card className={`${musicalCard()} shadow-2xl border-white/30`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                <LogIn className="h-6 w-6 text-pink-400" />
                Acesso ao Sistema
              </CardTitle>
              <CardDescription className="text-gray-200">
                Digite suas credenciais para entrar no portal musical
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 backdrop-blur-sm focus:border-pink-400 focus:ring-pink-400"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-medium">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 backdrop-blur-sm focus:border-pink-400 focus:ring-pink-400"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full py-3 text-lg font-semibold ${musicalButton('primary')} transform hover:scale-105 transition-all duration-200`}
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
              <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-center font-semibold text-white mb-3">🎭 Contas de Demonstração</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-medium">👑 Admin:</span>
                    <span className="text-gray-200">admin@demo.com / Admin@123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-300 font-medium">👤 Usuário:</span>
                    <span className="text-gray-200">usuario@demo.com / Usuario@123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-300 font-medium">🎸 Adolescente:</span>
                    <span className="text-gray-200">adolescente1@demo.com / Adolescente@123</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-300 text-sm">
              🎵 Sistema de Gestão Musical para Igrejas 🎵
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}