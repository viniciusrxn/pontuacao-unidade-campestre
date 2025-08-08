import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Smartphone, Download, Settings } from 'lucide-react';

interface PWAStatusProps {
  className?: string;
}

const PWAStatus: React.FC<PWAStatusProps> = ({ className = "" }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [swRegistered, setSWRegistered] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [cacheSize, setCacheSize] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check if PWA is installed
    const checkPWAInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsPWAInstalled(true);
      }
    };
    
    // Check service worker status
    const checkServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(() => {
          setSWRegistered(true);
          setLastUpdate(new Date());
        });
      }
    };

    // Estimate cache size
    const estimateCacheSize = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const usageInMB = ((estimate.usage || 0) / 1024 / 1024).toFixed(2);
          setCacheSize(`${usageInMB} MB`);
        } catch (error) {
          setCacheSize('N/A');
        }
      }
    };
    
    checkPWAInstalled();
    checkServiceWorker();
    estimateCacheSize();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefreshCache = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.update();
      setLastUpdate(new Date());
    }
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      setCacheSize('0 MB');
      window.location.reload();
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Status PWA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
          
          <Badge variant={isPWAInstalled ? "default" : "secondary"} className="text-xs">
            <Smartphone className="w-3 h-3 mr-1" />
            {isPWAInstalled ? "PWA Instalado" : "Web App"}
          </Badge>
          
          <Badge variant={swRegistered ? "default" : "destructive"} className="text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            {swRegistered ? "Service Worker Ativo" : "SW Inativo"}
          </Badge>
        </div>

        {/* Cache Info */}
        {cacheSize && (
          <div className="text-sm text-muted-foreground">
            <p><strong>Cache:</strong> {cacheSize}</p>
            {lastUpdate && (
              <p><strong>Última atualização:</strong> {lastUpdate.toLocaleTimeString()}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleRefreshCache}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Atualizar
          </Button>
          
          <Button
            onClick={handleClearCache}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🗑️ Limpar Cache
          </Button>
        </div>

        {/* Installation Status */}
        {!isPWAInstalled && (
          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <p className="text-blue-800 font-medium mb-1">
              💡 Dica: Instale como aplicativo
            </p>
            <p className="text-blue-700 text-xs">
              Para uma melhor experiência, instale este sistema como um aplicativo no seu dispositivo.
            </p>
          </div>
        )}

        {/* Offline Capabilities */}
        {!isOnline && (
          <div className="p-3 bg-orange-50 rounded-lg text-sm">
            <p className="text-orange-800 font-medium mb-1">
              📱 Modo Offline
            </p>
            <p className="text-orange-700 text-xs">
              Você está offline, mas pode continuar usando funcionalidades básicas.
              Os dados serão sincronizados quando a conexão for restabelecida.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PWAStatus;

