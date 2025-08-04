
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UnitLogoProps = {
  logo?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const UnitLogo: React.FC<UnitLogoProps> = ({ logo, name, size = 'md', className = '' }) => {
  const defaultLogo = 'https://i.imgur.com/KYU3KX5.png';
  const logoUrl = logo || defaultLogo;
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={logoUrl} alt={`${name} logo`} />
      <AvatarFallback className="text-sm font-semibold">{name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
};

export default UnitLogo;
