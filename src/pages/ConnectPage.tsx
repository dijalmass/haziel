import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCamera } from "@/hooks/useCamera";
import { useAuth } from "@/hooks/useAuth";
import { useWebRTC } from "@/hooks/useWebRTC";
import { db } from "@/lib/db";
import { CameraPreview } from "@/components/CameraPreview";
import { DeviceStatus } from "@/components/DeviceStatus";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { QUALITY_PRESETS, type QualityPreset } from "@/lib/constants";
import { Camera, Video, Settings, Link as LinkIcon, AlertCircle, Play, StopCircle } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { createSlug } from "@/lib/utils";

export default function ConnectPage() {
  const [deviceName, setDeviceName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [pin, setPin] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [obsUrl, setObsUrl] = useState("");
  const navigate = useNavigate();

  const { stream, devices, selectedDeviceId, quality, error: camError, start, stop, setQuality } = useCamera();
  const { authenticate, isAuthenticated, error: authError, wsStatus } = useAuth();
  const { send } = useWebSocket();
  const deviceSlug = createSlug(deviceName);
  const { addLocalStream } = useWebRTC("sender", deviceSlug);

  // Carrega PIN e nome salvo
  useEffect(() => {
    const loadPrefs = async () => {
      const prefs = await db.getPreferences();
      if (!prefs?.pin) {
        navigate("/auth?redirect=/connect");
        return;
      }
      setPin(prefs.pin);
      if (prefs.lastDeviceName) setDeviceName(prefs.lastDeviceName);
    };
    loadPrefs();
  }, [navigate]);

  // Solicita permissão da câmera na montagem para preencher o Select
  useEffect(() => {
    let mounted = true;
    const initCamera = async () => {
      if (mounted && !stream) {
        await start();
      }
    };
    initCamera();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza o stream local com o WebRTC
  useEffect(() => {
    if (stream && isStreaming) {
      addLocalStream(stream);
    }
  }, [stream, isStreaming, addLocalStream]);

  // Mantém a tela ligada durante o streaming (Wake Lock)
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isStreaming) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('[WakeLock] Tela mantida ligada');
        }
      } catch (err: any) {
        console.error(`[WakeLock] Erro: ${err.message}`);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release().then(() => {
          wakeLock = null;
          console.log('[WakeLock] Liberado');
        });
      }
    };
  }, [isStreaming]);

  const handleStartStreaming = useCallback(async () => {
    if (!deviceName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    // 1. Tenta autenticar/registrar no servidor usando o slug
    authenticate(pin, deviceSlug);
    
    // 2. Tenta abrir a câmera se ainda não estiver aberta
    if (!stream) {
      await start();
    }

    setIsStreaming(true);
    
    // Gera a URL para o OBS com o slug
    const ip = window.location.hostname;
    const port = window.location.port;
    const url = `${window.location.protocol}//${ip}${port ? ":" + port : ""}/view/${deviceSlug}?pin=${pin}&obs=true`;
    setObsUrl(url);
  }, [deviceName, deviceSlug, pin, stream, start, authenticate]);

  const handleStopStreaming = useCallback(() => {
    setIsStreaming(false);
    send({ type: 'disconnect' });
    stop();
  }, [stop, send]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(obsUrl);
    // TODO: Toast de sucesso
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 lg:p-8">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna de Configuração */}
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-zinc-100">
                <Settings className="h-5 w-5" />
                <CardTitle>Configuração</CardTitle>
              </div>
              <CardDescription>Configure sua câmera antes de transmitir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deviceName" className={`text-sm font-medium ${nameError ? "text-red-500" : "text-zinc-400"}`}>
                  Nome do Dispositivo
                </Label>
                <Input 
                  id="deviceName"
                  placeholder="Ex: Câmera Principal" 
                  value={deviceName}
                  onChange={(e) => {
                    setDeviceName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                  disabled={isStreaming}
                  className={`bg-zinc-800 text-zinc-100 focus:ring-zinc-600 ${
                    nameError ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-700"
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-red-500 mt-1">O nome do dispositivo é obrigatório</p>
                )}
                {deviceSlug && !nameError && (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    URL de acesso: <span className="font-mono text-zinc-400">/view/{deviceSlug}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Selecione a Câmera</Label>
                <Select 
                  value={selectedDeviceId} 
                  onValueChange={(val) => start(val)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Escolha a câmera" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    {devices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Câmera ${device.deviceId.slice(0, 5)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Qualidade</Label>
                <Select 
                  value={quality} 
                  onValueChange={(val: QualityPreset) => {
                    setQuality(val);
                    if (stream) start(selectedDeviceId, val);
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Escolha a qualidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    {Object.keys(QUALITY_PRESETS).map((key) => (
                      <SelectItem key={key} value={key}>
                        {key.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(camError || authError) && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{camError || authError}</span>
                </div>
              )}

              <Button 
                onClick={isStreaming ? handleStopStreaming : handleStartStreaming}
                className={`w-full font-bold h-12 transition-all ${
                  isStreaming 
                    ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-300" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isStreaming ? (
                  <><StopCircle className="mr-2 h-5 w-5" /> Parar Transmissão</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" /> Iniciar Transmissão</>
                )}
              </Button>
            </CardContent>
          </Card>

          {isStreaming && (
            <Card className="border-blue-900/30 bg-blue-950/10 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <LinkIcon className="h-5 w-5" />
                  <CardTitle className="text-lg">Link do OBS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={obsUrl}
                    className="bg-zinc-900 border-zinc-800 text-xs text-zinc-400 font-mono h-9"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                  >
                    Copiar
                  </Button>
                </div>
                <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed">
                  Adicione como <strong>Browser Source</strong> no OBS. 
                  Resolução recomendada: 1920x1080.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview da Câmera */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
            {stream ? (
              <CameraPreview 
                stream={stream} 
                isMirror={false}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 gap-4">
                <Video className="h-16 w-16 opacity-20" />
                <p className="text-sm">Clique em iniciar para ver o preview</p>
              </div>
            )}

            {/* Overlay de Status */}
            <div className="absolute top-4 right-4 z-10">
              <DeviceStatus 
                status={isStreaming ? (isAuthenticated ? 'online' : 'connecting') : 'offline'} 
              />
            </div>

            {isStreaming && (
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-widest uppercase bg-black/50 px-2 py-1 rounded">
                  Live
                </span>
                <span className="text-[10px] text-zinc-300 bg-black/50 px-2 py-1 rounded">
                  {quality.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-zinc-800 bg-zinc-900">
              <CardContent className="pt-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status do Sinalizador</div>
                <div className="text-xl font-bold text-zinc-200 capitalize">{wsStatus}</div>
              </CardContent>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900">
              <CardContent className="pt-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Câmera Atual</div>
                <div className="text-sm font-medium text-zinc-200 truncate">
                  {devices.find(d => d.deviceId === selectedDeviceId)?.label || "Nenhuma"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
