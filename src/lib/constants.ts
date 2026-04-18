export const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

export const WS_RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export const WS_HEARTBEAT_INTERVAL = 30000;

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [], // Rede local pura, sem necessidade de STUN por padrão
};

export const RTC_RECONNECT_TIMEOUT = 180000; // 3 minutos

export const QUALITY_PRESETS = {
  '4k': {
    width: { ideal: 3840 },
    height: { ideal: 2160 },
    frameRate: { ideal: 30 }
  },
  '1080p': {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 }
  },
  '720p': {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  'auto': true // Deixa o browser decidir
} as const;

export type QualityPreset = keyof typeof QUALITY_PRESETS;

export const PIN_LENGTH = 4;

export const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas
