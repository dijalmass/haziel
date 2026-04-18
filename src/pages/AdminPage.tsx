import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { db } from '../lib/db';
import { ArrowLeft, LayoutGrid, Camera, Signal, Copy, Check } from 'lucide-react';
import type { DeviceListResponse, DeviceOnlineEvent, DeviceOfflineEvent } from '../lib/signaling';

interface Device {
  name: string;
  status: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { status, send, on, off } = useWebSocket();
  const [devices, setDevices] = useState<Device[]>([]);
  const [pin, setPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const fetchDevices = useCallback(() => {
    if (pin && status === 'connected') {
      send({ type: 'list-devices', pin });
    }
  }, [pin, status, send]);

  const onDeviceList = useCallback((data: DeviceListResponse) => {
    console.log('[Admin] Received device list:', data.devices);
    setDevices(data.devices);
    setIsLoading(false);
  }, []);

  const onError = useCallback((data: any) => {
    console.error('[Admin] Server error:', data);
    if (data.code === 'UNKNOWN_TYPE') {
      setIsLoading(false);
    }
  }, []);

  const onDeviceOnline = useCallback((data: DeviceOnlineEvent) => {
    setDevices(prev => {
      if (prev.some(d => d.name === data.name)) return prev;
      return [...prev, { name: data.name, status: 'online' }];
    });
    setIsLoading(false);
  }, []);

  const onDeviceOffline = useCallback((data: DeviceOfflineEvent) => {
    setDevices(prev => prev.filter(d => d.name !== data.name));
  }, []);

  const copyObsUrl = useCallback((deviceName: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/view/${deviceName}?pin=${pin}&obs=true`;
    navigator.clipboard.writeText(url);
    setCopiedName(deviceName);
    setTimeout(() => setCopiedName(null), 2000);
  }, [pin]);

  useEffect(() => {
    db.getPreferences().then(prefs => {
      if (prefs?.pin) {
        setPin(prefs.pin);
      } else {
        navigate('/auth?redirect=/admin');
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (status === 'connected' && pin) {
      fetchDevices();
    }
  }, [status, pin, fetchDevices]);

  useEffect(() => {
    on('device-list', onDeviceList);
    on('device-online', onDeviceOnline);
    on('device-offline', onDeviceOffline);
    on('error', onError);

    return () => {
      off('device-list', onDeviceList);
      off('device-online', onDeviceOnline);
      off('device-offline', onDeviceOffline);
      off('error', onError);
    };
  }, [on, off, onDeviceList, onDeviceOnline, onDeviceOffline]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-zinc-500" />
              Multi-View Dashboard
            </h1>
            <p className="text-zinc-500 text-sm">Monitorando {devices.length} dispositivos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
          <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {status === 'connected' ? 'Servidor Online' : 'Desconectado'}
          </span>
        </div>
      </header>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-video bg-zinc-900 animate-pulse rounded-2xl border border-zinc-800" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-lg font-medium text-zinc-300">Nenhum dispositivo ativo</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mt-2">
              Ligue a câmera em algum celular e registre-o para vê-lo aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map(device => (
              <div 
                key={device.name}
                className="group relative aspect-video bg-black rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all shadow-xl shadow-black/50"
              >
                {/* Preview Iframe */}
                <iframe 
                  src={`/view/${device.name}?pin=${pin}&obs=true&lowBitrate=true`}
                  className="w-full h-full border-none pointer-events-none"
                  title={`Preview ${device.name}`}
                />

                {/* Overlay Interativo */}
                <div 
                  onClick={() => navigate(`/view/${device.name}?fromAdmin=true`)}
                  className="absolute inset-0 cursor-pointer bg-transparent group-hover:bg-black/20 transition-colors"
                />

                {/* Badge de Info */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                    <Signal className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-bold tracking-wide uppercase">{device.name}</span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyObsUrl(device.name);
                    }}
                    className="pointer-events-auto p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 hover:bg-white hover:text-black transition-all flex items-center gap-2"
                    title="Copiar URL para o OBS"
                  >
                    {copiedName === device.name ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                      {copiedName === device.name ? 'Copiado' : 'OBS URL'}
                    </span>
                  </button>
                </div>

                {/* Hover Action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                    Expandir Câmera
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
        <div>Haziel Admin Dashboard</div>
        <div>v0.4.0 — High Performance Multi-View</div>
      </footer>
    </div>
  );
}
