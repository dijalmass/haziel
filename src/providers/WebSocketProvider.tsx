import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { WS_URL, WS_RECONNECT_DELAYS, WS_HEARTBEAT_INTERVAL } from '../lib/constants';
import { type ClientMessage, type ServerMessage, parseServerMessage, createMessage } from '../lib/signaling';

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketContextType {
  status: WSStatus;
  send: (message: ClientMessage) => void;
  on: (type: ServerMessage['type'], callback: (data: any) => void) => void;
  off: (type: ServerMessage['type'], callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WSStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Shared Connection Connected');
      setStatus('connected');
      reconnectCountRef.current = 0;
      
      heartbeatIntervalRef.current = window.setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, WS_HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (event) => {
      try {
        const message = parseServerMessage(event.data);
        const typeListeners = listenersRef.current.get(message.type);
        if (typeListeners) {
          typeListeners.forEach(callback => callback(message));
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Shared Connection Disconnected');
      setStatus('disconnected');
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      const delay = WS_RECONNECT_DELAYS[Math.min(reconnectCountRef.current, WS_RECONNECT_DELAYS.length - 1)];
      setTimeout(() => {
        reconnectCountRef.current++;
        connect();
      }, delay);
    };

    ws.onerror = () => {
      setStatus('error');
    };
  }, []);

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(createMessage(message));
    } else {
      console.warn('[WS] Cannot send message, socket not open:', message);
    }
  }, []);

  const on = useCallback((type: ServerMessage['type'], callback: (data: any) => void) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type)!.add(callback);
  }, []);

  const off = useCallback((type: ServerMessage['type'], callback: (data: any) => void) => {
    listenersRef.current.get(type)?.delete(callback);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ status, send, on, off }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
