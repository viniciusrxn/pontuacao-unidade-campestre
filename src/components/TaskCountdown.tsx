import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  deadline: string;
  compact?: boolean;
}

const TaskCountdown: React.FC<Props> = ({ deadline, compact = false }) => {
  const [remaining, setRemaining] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical' | 'expired'>('normal');

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setRemaining('Expirado');
        setUrgency('expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 3) {
        setUrgency('normal');
        setRemaining(`${days}d ${hours}h`);
      } else if (days > 0) {
        setUrgency('warning');
        setRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setUrgency('critical');
        setRemaining(`${hours}h ${minutes}m`);
      } else {
        setUrgency('critical');
        setRemaining(`${minutes}m`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  const colorMap = {
    normal: 'text-gray-600 bg-gray-50',
    warning: 'text-amber-700 bg-amber-50',
    critical: 'text-red-700 bg-red-50 animate-pulse',
    expired: 'text-gray-400 bg-gray-100 line-through',
  };

  const iconColor = {
    normal: 'text-gray-400',
    warning: 'text-amber-500',
    critical: 'text-red-500',
    expired: 'text-gray-300',
  };

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${colorMap[urgency]}`}>
        {urgency === 'critical' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {remaining}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs sm:text-sm px-2 py-1 rounded-md ${colorMap[urgency]}`}>
      <Clock className={`w-3.5 h-3.5 ${iconColor[urgency]}`} />
      <span className="font-medium">{remaining}</span>
    </div>
  );
};

export default TaskCountdown;
