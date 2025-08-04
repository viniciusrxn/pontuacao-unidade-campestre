
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Lock, Shield, ChevronLeft } from 'lucide-react';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const { adminLogin, currentUser } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser && currentUser.type === 'admin') {
      navigate('/admin');
    }
    setIsRestoringSession(false);
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await adminLogin(password, keepLoggedIn);
      if (success) {
        toast({
          title: "Login de administrador bem-sucedido!",
          description: "Bem-vindo ao painel da Executiva.",
          variant: "default",
        });
        navigate('/admin');
      } else {
        toast({
          title: "Falha no login",
          description: "Senha de administrador inválida.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isRestoringSession) {
    return (
      <Layout>
        <div className="fixed inset-0 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Verificando sessão...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Versão mobile melhorada */}
      <div className="md:hidden min-h-screen bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 relative overflow-hidden">
        {/* Background Pattern - Simplificado e mais sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
        </div>

        {/* Header com botão voltar */}
        <div className="relative z-10 flex items-center justify-between p-4 pt-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>

        {/* Logo e header centralizado */}
        <div className="relative z-10 text-center px-4 pb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Área Administrativa</h1>
          <p className="text-white/80 text-sm font-medium">
            Acesso exclusivo para administradores
          </p>
        </div>

        {/* Card do formulário */}
        <div className="relative z-10 px-4 pb-8">
          <Card className="mx-auto max-w-sm shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-gray-600">
                Digite sua senha para acessar o painel
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Senha de Administrador
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      disabled={isLoading}
                      className="pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="keep-logged-in"
                    checked={keepLoggedIn}
                    onCheckedChange={(checked) => setKeepLoggedIn(checked === true)}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <Label 
                    htmlFor="keep-logged-in" 
                    className="text-sm text-gray-600 cursor-pointer flex items-center gap-1.5"
                  >
                    <Lock className="w-3 h-3" />
                    Manter conectado por 7 dias
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium h-11 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar no Painel'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">ou</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Não é um administrador?{' '}
                  <Button
                    variant="link"
                    onClick={() => navigate('/login')}
                    disabled={isLoading}
                    className="font-medium text-amber-600 hover:text-amber-700 p-0 h-auto"
                  >
                    Acessar como Unidade
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elemento decorativo na parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      </div>

      {/* Desktop design - mantido como estava */}
      <div className="hidden md:flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-64px)] w-full max-w-5xl mx-auto">
        {/* Left Panel - Verification Message */}
        <div className="w-full md:w-2/5 bg-accent rounded-l-2xl p-8 h-[500px] flex-col items-center justify-center text-accent-foreground flex">
          <div className="w-32 h-32 mb-6 relative">
            <div className="absolute bg-secondary w-10 h-10 rounded-full bottom-0 right-0"></div>
            <div className="absolute bg-white w-24 h-24 rounded-lg -rotate-12 flex items-center justify-center p-2">
              <img
                src="https://i.imgur.com/KYU3KX5.png"
                alt="Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Acesso Admin</h2>
          <p className="text-center opacity-80 text-sm mb-4">
            Painel exclusivo para administradores do sistema
          </p>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-3/5 bg-white md:rounded-r-2xl p-6 md:p-10 shadow-xl md:h-[500px]">
          <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Olá, Admin</h1>
              <p className="text-gray-500 text-sm">
                Estamos felizes em ver você de volta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password-desktop" className="text-sm font-medium text-gray-700">
                  Senha de Admin
                </Label>
                <div className="relative">
                  <Input
                    id="password-desktop"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite a senha de administrador"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  'Entrar como Admin'
                )}
              </Button>

              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="keep-logged-in-desktop"
                  checked={keepLoggedIn}
                  onCheckedChange={(checked) => setKeepLoggedIn(checked === true)}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor="keep-logged-in-desktop" 
                  className="text-sm text-gray-600 cursor-pointer flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Manter conectado (7 dias)
                </Label>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Não é um administrador?{' '}
                  <a
                    href="/login"
                    className="font-medium text-secondary hover:underline"
                  >
                    Acesso Unidade
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
