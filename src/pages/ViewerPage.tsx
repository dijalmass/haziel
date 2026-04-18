import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { VideoPlayer } from "../components/VideoPlayer";
import { DeviceStatus } from "../components/DeviceStatus";
import { db } from "../lib/db";
import { Loader2, MonitorOff, Camera, ArrowLeft } from "lucide-react";

export default function ViewerPage() {
  const { name } = useParams<{ name: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const obsMode = searchParams.get("obs") === "true";
  const urlPin = searchParams.get("pin");
  const lowBitrate = searchParams.get("lowBitrate") === "true";
  const fromAdmin = searchParams.get("fromAdmin") === "true";
  
  const { send, status: wsStatus, on, off } = useWebSocket();
  const { remoteStream, connectionState, reset } = useWebRTC("viewer", name);
  
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initViewer = useCallback(async () => {
    if (wsStatus !== 'connected' || !name) return;

    // 1. Resolve PIN
    let targetPin = urlPin;
    if (!targetPin) {
      const prefs = await db.getPreferences();
      targetPin = prefs?.pin || null;
    }

    if (!targetPin) {
      navigate(`/auth?redirect=/view/${name}`);
      return;
    }

    // 2. Envia 'view'
    send({ type: 'view', name, pin: targetPin, lowBitrate });
    setIsReady(true);
  }, [wsStatus, name, urlPin, lowBitrate, send, navigate]);

  useEffect(() => {
    initViewer();
  }, [initViewer]);

  // Monitora quando o dispositivo volta a ficar online ou sai
  useEffect(() => {
    const handleDeviceOnline = (data: { name: string }) => {
      if (data.name === name) {
        console.log(`[Viewer] Device ${name} is back online. Reconnecting...`);
        setTimeout(initViewer, 1000); // Pequeno delay para o sender estar pronto
      }
    };

    const handleDeviceOffline = (data: { name: string }) => {
      if (data.name === name) {
        console.log(`[Viewer] Device ${name} went offline.`);
        setIsReady(false);
        reset();
      }
    };

    on('device-online', handleDeviceOnline);
    on('device-offline', handleDeviceOffline);
    
    return () => {
      off('device-online', handleDeviceOnline);
      off('device-offline', handleDeviceOffline);
    };
  }, [name, on, off, initViewer]);

  // Se estiver no modo OBS, renderiza apenas o vídeo
  if (obsMode) {
    return (
      <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
        {remoteStream ? (
          <VideoPlayer 
            stream={remoteStream} 
            deviceName={name}
            obsMode={true}
            isRemote={true}
            autoPlay={true}
            className="w-full h-full"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-zinc-800">
            {connectionState === 'connecting' ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <MonitorOff className="h-12 w-12" />
            )}
            <span className="text-[10px] font-bold tracking-widest uppercase">
              {connectionState.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Camera className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">{name}</h1>
              <p className="text-xs text-zinc-500 uppercase tracking-tighter">Remote Device</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {fromAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                DASHBOARD
              </button>
            )}
            <DeviceStatus status={remoteStream ? 'online' : (connectionState === 'connecting' ? 'connecting' : 'offline')} />
          </div>
        </div>

        <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
          {remoteStream ? (
            <VideoPlayer 
              stream={remoteStream} 
              deviceName={name}
              isRemote={true}
              autoPlay={true}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 gap-4">
              {connectionState === 'connecting' ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-zinc-800" />
                  <p className="text-sm font-medium animate-pulse">Estabelecendo conexão P2P...</p>
                </>
              ) : (
                <>
                  <MonitorOff className="h-16 w-16 opacity-20" />
                  <p className="text-sm">Aguardando sinalização de {name}...</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">WebRTC State</div>
            <div className="text-sm font-bold text-zinc-300 capitalize">{connectionState}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Signaling</div>
            <div className="text-sm font-bold text-zinc-300 capitalize">{wsStatus}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Latency</div>
            <div className="text-sm font-bold text-blue-400">Ultra-Low (P2P)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
