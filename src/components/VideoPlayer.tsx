import { useEffect, useRef } from 'react';
import { DeviceStatus } from './DeviceStatus';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoPlayerProps {
  stream: MediaStream | null;
  deviceName?: string;
  obsMode?: boolean;
  status?: 'online' | 'offline' | 'streaming' | 'reconnecting' | 'connecting';
  className?: string;
  isRemote?: boolean;
  autoPlay?: boolean;
}

export function VideoPlayer({ 
  stream, 
  deviceName = 'Device', 
  obsMode = false, 
  status = 'streaming',
  className = '',
  isRemote = false,
  autoPlay = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (obsMode) {
    return (
      <div className={`fixed inset-0 bg-black w-screen h-screen ${className}`}>
        {stream ? (
          <video
            ref={videoRef}
            autoPlay={autoPlay}
            muted // Viewer mute by default as per req (video only)
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <p className="text-zinc-800 font-bold text-4xl uppercase tracking-tighter">Offline</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay={autoPlay}
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-zinc-900">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm">Aguardando stream de {deviceName}...</p>
            </div>
          </div>
        )}
        
        {stream && (
          <div className="absolute top-4 left-4">
            <DeviceStatus status={status as any} />
          </div>
        )}
      </div>
      
      {!isRemote && !obsMode && (
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-semibold text-zinc-100">{deviceName}</h3>
          <p className="text-sm text-zinc-400">P2P Streaming via WebRTC</p>
        </div>
      )}
    </div>
  );
}
