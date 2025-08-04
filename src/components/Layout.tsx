
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Menu, X, Home, BarChart3, User, LogIn, Shield, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout, units } = useAppContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    toast({
      title: "Desconectado com sucesso!",
      description: "Você foi desconectado do sistema.",
    });
  };

  const currentUnit = currentUser?.type === 'unit' && currentUser.unitId 
    ? units.find(unit => unit.id === currentUser.unitId)
    : null;

  const getUserDisplayName = () => {
    if (currentUser?.type === 'admin') return 'Admin';
    if (currentUnit) return currentUnit.name;
    return '';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Ranking Geral';
      case '/unit-dashboard': return 'Minha Unidade';
      case '/admin': return 'Painel Admin';
      case '/weekly-attendance': return 'Presença Semanal';
      case '/weekly-attendance-history': return 'Histórico de Presenças';
      default: return 'Ranking Unidade';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-primary via-primary/95 to-secondary shadow-lg sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo Section */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 md:space-x-3 text-white hover:text-white/90 transition-colors group"
            >
              <div className="relative">
            <img
              src="https://i.imgur.com/KYU3KX5.png"
              alt="Ranking Unidade"
                  className="h-8 md:h-12 w-auto transition-transform group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold tracking-tight">
                  Ranking Unidade
                </span>
                <span className="text-xs md:text-sm text-white/80 hidden sm:block">
                  {getPageTitle()}
                </span>
              </div>
          </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center space-x-4">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "bg-white/10 text-white hover:bg-white/20 hover:text-white focus:bg-white/20 focus:text-white"
                        )}
                        asChild
                      >
                        <Link to="/">
                          <Home className="w-4 h-4 mr-2" />
                          Início
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>

                    {currentUser && (
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="bg-white/10 text-white hover:bg-white/20 hover:text-white data-[state=open]:bg-white/20 data-[state=open]:text-white">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Dashboard
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid w-[400px] gap-3 p-4">
                            {currentUser.type === 'unit' ? (
                              <>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to="/unit-dashboard"
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  >
                                    <div className="text-sm font-medium leading-none">Minha Unidade</div>
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      Veja suas tarefas, submissões e progresso
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to="/weekly-attendance"
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  >
                                    <div className="text-sm font-medium leading-none">Presença Semanal</div>
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      Registre a presença da sua unidade
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to="/weekly-attendance-history"
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  >
                                    <div className="text-sm font-medium leading-none">Histórico</div>
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      Veja o histórico de presenças
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </>
                            ) : (
                              <NavigationMenuLink asChild>
                                <Link
                                  to="/admin"
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">Painel Administrativo</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Gerencie unidades, tarefas e validações
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            )}
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    )}
                  </NavigationMenuList>
                </NavigationMenu>

                {/* User Section */}
                {currentUser ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUnit?.logo} />
                        <AvatarFallback className="bg-white/20 text-white text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block">
                        <div className="text-sm font-medium text-white">
                          {getUserDisplayName()}
                        </div>
                        <div className="text-xs text-white/70">
                          {currentUser.type === 'admin' ? 'Administrador' : 'Unidade'}
                        </div>
                      </div>
                      {currentUser.type === 'unit' && currentUnit && (
                        <Badge variant="secondary" className="hidden xl:inline-flex bg-white/20 text-white border-white/30">
                          {currentUnit.score} pts
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/20">
                      <Link to="/login">
                        <LogIn className="w-4 h-4 mr-2" />
                        Login Unidade
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link to="/admin-login">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu */}
            {isMobile && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-white hover:bg-white/20 p-2"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96">
                  <SheetHeader className="text-left pb-4">
                    <SheetTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                      <img
                        src="https://i.imgur.com/KYU3KX5.png"
                        alt="Logo"
                        className="h-8 w-8"
                      />
                      <span>Menu</span>
                    </SheetTitle>
                    {currentUser && (
                      <div className="flex items-center space-x-3 mt-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentUnit?.logo} />
                          <AvatarFallback className="bg-primary text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>{currentUser.type === 'admin' ? 'Administrador' : 'Unidade'}</span>
                            {currentUser.type === 'unit' && currentUnit && (
                              <Badge variant="secondary" className="text-xs">
                                {currentUnit.score} pts
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </SheetHeader>

                  <nav className="flex-1 space-y-2 mt-6">
                        <Link
                          to="/"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                      <Home className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                      <span className="font-medium text-gray-900">Início</span>
                        </Link>

                        {currentUser ? (
                          <>
                            {currentUser.type === 'unit' ? (
                          <>
                              <Link
                                to="/unit-dashboard"
                              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                              <User className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                              <span className="font-medium text-gray-900">Minha Unidade</span>
                              </Link>
                            <Link
                              to="/weekly-attendance"
                              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <BarChart3 className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                              <span className="font-medium text-gray-900">Presença Semanal</span>
                            </Link>
                            <Link
                              to="/weekly-attendance-history"
                              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <BarChart3 className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                              <span className="font-medium text-gray-900">Histórico</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <BarChart3 className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                            <span className="font-medium text-gray-900">Painel Admin</span>
                          </Link>
                        )}

                        <div className="pt-4 mt-6 border-t border-gray-200">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all duration-200 group w-full text-left"
                          >
                            <LogOut className="h-5 w-5 text-red-600 group-hover:text-red-700 transition-colors" />
                            <span className="font-medium text-red-600 group-hover:text-red-700 transition-colors">
                              Sair
                            </span>
                          </button>
                        </div>
            </>
          ) : (
                      <>
                  <Link
                    to="/login"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                          onClick={() => setMobileMenuOpen(false)}
                  >
                          <LogIn className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                          <span className="font-medium text-gray-900">Login Unidade</span>
                  </Link>
                  <Link
                    to="/admin-login"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                          onClick={() => setMobileMenuOpen(false)}
                  >
                          <Shield className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                          <span className="font-medium text-gray-900">Admin</span>
                  </Link>
                      </>
              )}
            </nav>
                </SheetContent>
              </Sheet>
          )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-4 md:py-8 px-4 min-h-[calc(100vh-200px)]">
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img
                src="https://i.imgur.com/KYU3KX5.png"
                alt="Logo"
                className="h-8 w-8"
              />
              <div>
                <div className="font-bold">Ranking Unidade</div>
                <div className="text-sm text-gray-400">Sistema de Pontuação</div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                © 2025 Pontuação Unidade - Desenvolvido por Vinicius
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Versão 1.0 - Progressive Web App
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
