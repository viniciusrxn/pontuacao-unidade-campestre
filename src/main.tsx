import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível. Recarregar para atualizar?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App pronto para uso offline!')
    // Opcional: mostrar toast de notificação
    if ('serviceWorker' in navigator) {
      // Show offline ready notification
      const toast = document.createElement('div')
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        max-width: 300px;
      `
      toast.textContent = '✅ App pronto para uso offline!'
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.remove()
      }, 4000)
    }
  },
  onRegistered(r) {
    console.log('SW Registrado: ' + r)
  },
  onRegisterError(error) {
    console.log('SW erro de registro', error)
  },
})

createRoot(document.getElementById("root")!).render(<App />);
