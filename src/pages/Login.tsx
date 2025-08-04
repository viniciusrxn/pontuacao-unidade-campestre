import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '@/components/ui/use-toast';
import UnitLogo from '@/components/UnitLogo';
import { Eye, EyeOff, Lock } from 'lucide-react';

const Login = () => {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const { units, login, currentUser } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in and redirect if needed
  useEffect(() => {
    if (currentUser && currentUser.type === 'unit') {
      navigate('/unit-dashboard');
    }
    // Set initial session restoration to false after checking current user
    setIsRestoringSession(false);
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(selectedUnit, password, keepLoggedIn);
      
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao painel da sua unidade.",
          variant: "default",
        });
        navigate('/unit-dashboard');
      } else {
        toast({
          title: "Falha no login",
          description: "Verifique sua unidade e senha.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading spinner while restoring session
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
      {/* Mobile-first design - Redesigned */}
      <div className="md:hidden min-h-screen bg-gradient-to-br from-primary via-red-600 to-secondary relative overflow-hidden">
        {/* Floating Elements Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated floating circles */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-16 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-white/8 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          {/* Modern wave background */}
          <div className="absolute bottom-0 w-full">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 text-white/20">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Header Section with Logo */}
        <div className="relative z-10 pt-12 pb-6 text-center">
          <div className="w-28 h-28 mx-auto mb-4 bg-white/15 rounded-3xl backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
            <img
              src="https://i.imgur.com/KYU3KX5.png"
              alt="Logo"
              className="w-20 h-20 object-contain drop-shadow-lg"
            />
          </div>
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Ranking Unidade</h1>
            <p className="text-white/80 text-sm font-medium">Sistema de Pontuação</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="relative z-10 mx-4 mb-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8 transform hover:scale-[1.02] transition-all duration-300">
            {/* Welcome Section */}
            <div className="text-center space-y-3">
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Olá, Unidade</h2>
              <p className="text-gray-500 text-base font-medium">
                Estamos felizes em ver você de volta ✨
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Unit Selection */}
              <div className="space-y-3">
                <Label htmlFor="unit" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Unidade
                </Label>
                <div className="relative">
                  <select
                    id="unit"
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary text-sm bg-gray-50/50 backdrop-blur-sm font-medium transition-all duration-300 appearance-none cursor-pointer"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="" disabled>
                      Selecione sua unidade
                    </option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {selectedUnit && (
                  <div className="mt-4 flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 transform animate-in slide-in-from-top duration-500">
                    <div className="relative">
                      <UnitLogo
                        logo={units.find((u) => u.id === selectedUnit)?.logo}
                        name={units.find((u) => u.id === selectedUnit)?.name || ''}
                        size="md"
                      />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800">{units.find((u) => u.id === selectedUnit)?.name}</span>
                      <p className="text-xs text-gray-500 font-medium">Unidade selecionada</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite a senha da sua unidade"
                    className="w-full p-4 pr-12 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary/20 focus:border-secondary bg-gray-50/50 backdrop-blur-sm font-medium transition-all duration-300"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full p-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isLoading ? "Entrando..." : "Entrar"}
                </div>
              </button>

              {/* Keep logged in checkbox */}
              <div className="flex items-center justify-center space-x-3 mt-6">
                <Checkbox 
                  id="keep-logged-in"
                  checked={keepLoggedIn}
                  onCheckedChange={(checked) => setKeepLoggedIn(checked === true)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label 
                  htmlFor="keep-logged-in" 
                  className="text-sm text-gray-600 cursor-pointer flex items-center gap-2 font-medium"
                >
                  <Lock className="h-4 w-4" />
                  Manter conectado (7 dias)
                </Label>
              </div>

              {/* Admin Access Link */}
              <div className="text-center pt-4 border-t border-gray-100">
                <a
                  href="/admin-login"
                  className="inline-flex items-center gap-2 font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary transition-all duration-300"
                >
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V9a3 3 0 00-6 0v2" />
                  </svg>
                  Acesso Admin
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-white to-secondary"></div>
      </div>

      {/* Desktop design - unchanged */}
      <div className="hidden md:flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-64px)] w-full max-w-5xl mx-auto">
        {/* Left Panel - Verification Message */}
        <div className="w-full md:w-2/5 bg-secondary rounded-l-2xl p-8 h-[500px] flex-col items-center justify-center text-white flex">
          <div className="w-32 h-32 mb-6 relative">
            <div className="absolute bg-yellow-400 w-10 h-10 rounded-full bottom-0 right-0"></div>
            <div className="absolute bg-white w-24 h-24 rounded-lg -rotate-12 flex items-center justify-center p-2">
              <img
                src="https://i.imgur.com/KYU3KX5.png"
                alt="Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Acesso Verificado</h2>
          <p className="text-center opacity-80 text-sm mb-4">
            Painel exclusivo para unidades registradas
          </p>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-3/5 bg-white md:rounded-r-2xl p-6 md:p-10 shadow-xl md:h-[500px]">
          <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Olá, Unidade</h1>
              <p className="text-gray-500 text-sm">
                Estamos felizes em ver você de volta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="unit-desktop" className="text-sm font-medium text-gray-700">
                  Unidade
                </Label>
                <select
                  id="unit-desktop"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    Selecione sua unidade
                  </option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>

                {selectedUnit && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <UnitLogo
                      logo={units.find((u) => u.id === selectedUnit)?.logo}
                      name={units.find((u) => u.id === selectedUnit)?.name || ''}
                    />
                    <span>{units.find((u) => u.id === selectedUnit)?.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-desktop" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password-desktop"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite a senha da sua unidade"
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
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
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Login"}
              </Button>

              {/* Keep logged in checkbox - Desktop */}
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="keep-logged-in-desktop"
                  checked={keepLoggedIn}
                  onCheckedChange={(checked) => setKeepLoggedIn(checked === true)}
                />
                <Label 
                  htmlFor="keep-logged-in-desktop" 
                  className="text-sm text-gray-600 cursor-pointer flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Manter conectado (7 dias)
                </Label>
              </div>

              <div className="text-center">
                <a
                  href="/admin-login"
                  className="font-medium text-secondary hover:underline"
                >
                  Acesso Admin
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
