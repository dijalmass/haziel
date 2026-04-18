import { useState, useEffect, useCallback, useRef } from 'react';
import { QUALITY_PRESETS, type QualityPreset } from '../lib/constants';
import { db } from '../lib/db';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [quality, setQuality] = useState<QualityPreset>('auto');
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const start = useCallback(async (deviceId?: string, preset?: QualityPreset) => {
    stop();
    setError(null);

    const targetDeviceId = deviceId || selectedDeviceId;
    const targetQuality = preset || quality;

    try {
      const constraints: MediaStreamConstraints = {
        audio: false, // Apenas vídeo conforme decidido
        video: targetQuality === 'auto' 
          ? { deviceId: targetDeviceId ? { exact: targetDeviceId } : undefined }
          : { 
              deviceId: targetDeviceId ? { exact: targetDeviceId } : undefined,
              ...QUALITY_PRESETS[targetQuality as keyof typeof QUALITY_PRESETS] as MediaTrackConstraints
            }
      };

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Câmera não disponível (verifique se está usando HTTPS)');
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (deviceId) setSelectedDeviceId(deviceId);
      if (preset) setQuality(preset);

      // Persiste preferências
      db.savePreferences({ 
        preferredCamera: targetDeviceId, 
        preferredQuality: targetQuality 
      });

    } catch (err: any) {
      console.error('[Camera] Error starting stream:', err);
      setError(err.message || 'Erro ao acessar câmera');
    }
  }, [selectedDeviceId, quality, stop]);

  const refreshDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setError('Acesso à câmera não disponível neste navegador (requer HTTPS)');
        return;
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput' && d.deviceId);
      setDevices(videoDevices);
      
      // Se não houver device selecionado, tenta restaurar das preferências
      if (!selectedDeviceId) {
        const prefs = await db.getPreferences();
        if (prefs?.preferredCamera) {
          setSelectedDeviceId(prefs.preferredCamera);
        } else if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      }
    } catch (err) {
      console.error('[Camera] Error listing devices:', err);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    refreshDevices();
    
    const media = navigator.mediaDevices;
    if (media) {
      media.addEventListener('devicechange', refreshDevices);
    }
    
    return () => {
      stop();
      if (media) {
        media.removeEventListener('devicechange', refreshDevices);
      }
    };
  }, [refreshDevices, stop]);

  return {
    stream,
    devices,
    selectedDeviceId,
    quality,
    error,
    start,
    stop,
    setQuality,
    refreshDevices
  };
}
