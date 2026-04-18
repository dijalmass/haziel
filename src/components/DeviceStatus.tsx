import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

export type DeviceStatusType = 'online' | 'offline' | 'streaming' | 'reconnecting' | 'connecting';

interface DeviceStatusProps {
  status: DeviceStatusType;
  className?: string;
}

export function DeviceStatus({ status, className }: DeviceStatusProps) {
  const statusConfig = {
    online: {
      label: 'Online',
      variant: 'success' as const,
      dotClass: 'bg-emerald-500'
    },
    offline: {
      label: 'Offline',
      variant: 'secondary' as const,
      dotClass: 'bg-zinc-500'
    },
    streaming: {
      label: 'Ao Vivo',
      variant: 'default' as const,
      className: 'bg-blue-500 hover:bg-blue-600 border-none',
      dotClass: 'bg-white animate-pulse'
    },
    reconnecting: {
      label: 'Reconectando',
      variant: 'warning' as const,
      dotClass: 'bg-amber-500 animate-bounce'
    },
    connecting: {
      label: 'Conectando',
      variant: 'warning' as const,
      dotClass: 'bg-amber-500 animate-pulse'
    }
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant={config.variant} 
      className={cn('gap-2 px-3 py-1', (config as any).className, className)}
    >
      <span className={cn('h-2 w-2 rounded-full', config.dotClass)} />
      {config.label}
    </Badge>
  );
}
