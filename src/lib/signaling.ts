// === Mensagens Client -> Server ===

export type RegisterMessage = { 
  type: 'register'; 
  name: string; 
  pin: string 
};

export type ViewMessage = { 
  type: 'view'; 
  name: string; 
  pin: string;
  lowBitrate?: boolean;
};

export type ListDevicesMessage = {
  type: 'list-devices';
  pin: string;
};

export type OfferMessage = { 
  type: 'offer'; 
  target?: string; 
  viewerId?: string;
  sdp: RTCSessionDescriptionInit 
};

export type AnswerMessage = { 
  type: 'answer'; 
  target?: string; 
  viewerId?: string;
  sdp: RTCSessionDescriptionInit 
};

export type IceCandidateMessage = { 
  type: 'ice-candidate'; 
  target?: string; 
  viewerId?: string;
  candidate: RTCIceCandidateInit 
};

export type HeartbeatMessage = { 
  type: 'heartbeat' 
};

export type DisconnectMessage = { 
  type: 'disconnect' 
};

export type ClientMessage = 
  | RegisterMessage 
  | ViewMessage 
  | ListDevicesMessage
  | OfferMessage 
  | AnswerMessage 
  | IceCandidateMessage 
  | HeartbeatMessage 
  | DisconnectMessage;

// === Mensagens Server -> Client ===

export type RegisteredResponse = { 
  type: 'registered'; 
  token: string; 
  name: string 
};

export type AuthErrorResponse = { 
  type: 'auth-error'; 
  reason: string 
};

export type ViewerJoinedResponse = { 
  type: 'viewer-joined'; 
  viewerId: string;
  lowBitrate?: boolean;
};

export type DeviceListResponse = {
  type: 'device-list';
  devices: { name: string; status: string }[];
};

export type DeviceOnlineEvent = { 
  type: 'device-online'; 
  name: string 
};

export type DeviceOfflineEvent = { 
  type: 'device-offline'; 
  name: string 
};

export type ErrorResponse = { 
  type: 'error'; 
  code: string; 
  message: string 
};

export type ServerMessage = 
  | RegisteredResponse 
  | AuthErrorResponse 
  | ViewerJoinedResponse 
  | DeviceListResponse
  | DeviceOnlineEvent 
  | DeviceOfflineEvent 
  | ErrorResponse 
  | OfferMessage 
  | AnswerMessage 
  | IceCandidateMessage;

// === Helpers ===

export function createMessage<T extends ClientMessage>(message: T): string {
  return JSON.stringify(message);
}

export function parseServerMessage(data: string): ServerMessage {
  return JSON.parse(data) as ServerMessage;
}
