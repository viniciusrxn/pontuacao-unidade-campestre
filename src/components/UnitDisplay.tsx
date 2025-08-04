
import React from 'react';
import UnitLogo from './UnitLogo';

type UnitDisplayProps = {
  name: string;
  logo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const UnitDisplay: React.FC<UnitDisplayProps> = ({ name, logo, size = 'md', className = '' }) => {
  return (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
      <UnitLogo logo={logo} name={name} size={size} />
      <span className="text-sm md:text-lg font-medium truncate">{name}</span>
    </div>
  );
};

export default UnitDisplay;
