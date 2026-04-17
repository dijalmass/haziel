import type { ServerWebSocket } from "bun";

// === Client → Server ===
export type RegisterMessage = { type: 'register'; name: string; pin: string };
export type ViewMessage = { type: 'view'; name: string; pin: string };
export type OfferMessage = { type: 'offer'; target: string; sdp: RTCSessionDescriptionInit };
export type AnswerMessage = { type: 'answer'; target: string; sdp: RTCSessionDescriptionInit };
export type IceCandidateMessage = { type: 'ice-candidate'; target: string; candidate: RTCIceCandidateInit };
export type HeartbeatMessage = { type: 'heartbeat' };
export type DisconnectMessage = { type: 'disconnect' };

export type ClientMessage = 
  | RegisterMessage 
  | ViewMessage 
  | OfferMessage 
  | AnswerMessage 
  | IceCandidateMessage 
  | HeartbeatMessage 
  | DisconnectMessage;

// === Server → Client ===
export type RegisteredResponse = { type: 'registered'; token: string; name: string };
export type AuthErrorResponse = { type: 'auth-error'; reason: string };
export type ViewerJoinedResponse = { type: 'viewer-joined'; viewerId: string };
export type DeviceOnlineEvent = { type: 'device-online'; name: string };
export type DeviceOfflineEvent = { type: 'device-offline'; name: string };
export type ErrorResponse = { type: 'error'; code: string; message: string };

export type ServerMessage = 
  | RegisteredResponse 
  | AuthErrorResponse 
  | ViewerJoinedResponse 
  | DeviceOnlineEvent 
  | DeviceOfflineEvent 
  | ErrorResponse 
  | OfferMessage 
  | AnswerMessage 
  | IceCandidateMessage;

// === DeviceInfo ===
export type WsData = {
  type: 'sender' | 'viewer' | 'unknown';
  name?: string;
  token?: string;
  viewTarget?: string;
};

export type DeviceInfo = {
  name: string;
  ws: ServerWebSocket<WsData>;
  status: 'online' | 'streaming';
  token: string;
  registeredAt: number;
  lastHeartbeat: number;
};
