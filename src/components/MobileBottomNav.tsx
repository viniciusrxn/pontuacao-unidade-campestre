import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, CalendarCheck, Newspaper, Menu as MenuIcon, Shield, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '../contexts/AppContext';

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { currentUser } = useAppContext();

  const isActive = (path: string) => location.pathname === path;

  // Haptic feedback leve em toques (quando suportado)
  const tap = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate?.(8); } catch {}
    }
  };

  // Definir itens conforme estado de autenticação
  const items = (() => {
    if (!currentUser) {
      return [
        { to: '/', icon: Home, label: 'Início' },
        { to: '/login', icon: LogIn, label: 'Login' },
        { to: '/admin-login', icon: Shield, label: 'Admin' },
      ] as const;
    }
    if (currentUser.type === 'unit') {
      return [
        { to: '/', icon: Home, label: 'Ranking' },
        { to: '/unit-dashboard', icon: BarChart3, label: 'Painel' },
        { to: '/weekly-attendance', icon: CalendarCheck, label: 'Presença' },
        { to: '/weekly-attendance-history', icon: Newspaper, label: 'Histórico' },
      ] as const;
    }
    return [
      { to: '/', icon: Home, label: 'Ranking' },
      { to: '/admin', icon: BarChart3, label: 'Admin' },
    ] as const;
  })();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegação inferior"
    >
      <ul className="grid grid-cols-5 h-14">
        {items.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <li key={to} className="flex">
              <Link
                to={to}
                onClick={tap}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 w-full text-[10px] font-medium transition-colors active:scale-95 active:bg-muted/60',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
                <span className="leading-tight">{label}</span>
                {active && <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
        {/* Botão Menu sempre visível para acesso ao Sheet completo */}
        <li className="flex">
          <button
            type="button"
            onClick={() => { tap(); onMenuClick(); }}
            className="flex flex-col items-center justify-center gap-0.5 w-full text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors active:scale-95 active:bg-muted/60"
            aria-label="Abrir menu"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="leading-tight">Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
