import { useEffect, useRef, useState } from 'react';
import { Badge } from './ui/badge';

interface CameraPreviewProps {
  stream: MediaStream | null;
  className?: string;
  isMirror?: boolean;
}

export function CameraPreview({ stream, className, isMirror = true }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className={`aspect-video bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 ${className}`}>
        <p className="text-zinc-500 text-sm">Câmera não iniciada</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onClick={toggleFullscreen}
      className={`relative aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 cursor-pointer group ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`w-full h-full object-cover ${isMirror ? 'scale-x-[-1]' : ''}`}
      />
      
      {!isFullscreen && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <p className="text-white text-[10px] font-bold tracking-widest uppercase bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            Toque para Tela Cheia
          </p>
        </div>
      )}

      <div className="absolute top-2 left-2 pointer-events-none">
        <Badge variant="success" className="bg-emerald-500 text-white border-none shadow-lg">
          <span className="flex h-2 w-2 rounded-full bg-white animate-pulse mr-2" />
          AO VIVO
        </Badge>
      </div>
    </div>
  );
}
