import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Share, Smartphone, Monitor, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const InstallPrompt: React.FC = () => {
  const { showInstallPrompt, canInstall, isIOS, handleInstallClick, hideInstallPrompt } = useInstallPrompt();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check if PWA is already installed
    const checkPWAInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsPWAInstalled(true);
      }
    };
    
    checkPWAInstalled();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center relative">
                <img
                  src="/icons/icon-192x192.png"
                  alt="Sistema Unidade 85"
                  className="w-8 h-8"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://i.imgur.com/KYU3KX5.png";
                  }}
                />
                {isPWAInstalled && (
                  <Badge className="absolute -top-2 -right-2 text-xs bg-green-500">
                    ✓
                  </Badge>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">Sistema PWA</h3>
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPWAInstalled ? "App já instalado" : "Unidade 85"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={hideInstallPrompt}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {!isPWAInstalled && (
              <>
                <p className="text-sm text-muted-foreground">
                  Instale o app para uma melhor experiência com:
                </p>
                
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    Acesso mais rápido
                  </li>
                  <li className="flex items-center gap-2">
                    <WifiOff className="w-4 h-4 text-primary" />
                    Funciona offline
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    Atualizações automáticas
                  </li>
                  <li className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    Interface nativa
                  </li>
                </ul>
              </>
            )}

            {/* Status do PWA */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                {isOnline ? "✓ Online" : "⚠ Offline"}
              </Badge>
              {isPWAInstalled && (
                <Badge variant="default" className="text-xs bg-green-500">
                  ✓ PWA Instalado
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                🔄 Service Worker Ativo
              </Badge>
            </div>

            {isIOS ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Para instalar no iOS:
                </p>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="font-medium">1.</span>
                    Toque no ícone <Share className="w-4 h-4 inline mx-1" /> (Compartilhar)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium">2.</span>
                    Selecione "Adicionar à Tela de Início"
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium">3.</span>
                    Toque em "Adicionar"
                  </li>
                </ol>
                <Button
                  onClick={hideInstallPrompt}
                  className="w-full"
                  variant="outline"
                >
                  Entendi
                </Button>
              </div>
            ) : canInstall ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar
                </Button>
                <Button
                  onClick={hideInstallPrompt}
                  variant="outline"
                  className="flex-1"
                >
                  Agora não
                </Button>
              </div>
            ) : (
              <Button
                onClick={hideInstallPrompt}
                className="w-full"
                variant="outline"
              >
                Fechar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;