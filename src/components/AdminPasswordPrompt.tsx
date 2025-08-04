
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminPasswordPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
  description: string;
  actionText: string;
  isDestructive?: boolean;
}

const AdminPasswordPrompt: React.FC<AdminPasswordPromptProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionText,
  isDestructive = false
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = () => {
    if (password.trim()) {
      onConfirm(password);
      setPassword('');
      setShowPassword(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="mx-4 sm:mx-0 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-5 h-5 text-amber-500" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium">
              Senha do Administrador:
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha de admin"
                className="pr-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password.trim()) {
                    handleConfirm();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-10 w-10 px-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!password.trim()}
            className={`w-full sm:w-auto ${
              isDestructive 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                : ''
            }`}
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminPasswordPrompt;
