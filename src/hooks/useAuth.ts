import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { db } from '../lib/db';
import type { RegisteredResponse, AuthErrorResponse, ErrorResponse } from '../lib/signaling';

export function useAuth() {
  const { status, send, on, off } = useWebSocket();
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback((pin: string, deviceName?: string) => {
    setIsLoading(true);
    setError(null);
    
    // Se estiver conectando para ver, o nome é passado na rota/param
    // Se estiver conectando para transmitir, o nome é definido na UI
    if (deviceName) {
      send({ type: 'register', name: deviceName, pin });
    } else {
      // Para viewers, o processo é um pouco diferente (handleView no server)
      // mas o useAuth pode gerenciar o estado do PIN/Token globalmente
    }
  }, [send]);

  const onRegistered = useCallback((data: RegisteredResponse) => {
    setToken(data.token);
    setName(data.name);
    db.saveSession(data.token);
    db.savePreferences({ lastDeviceName: data.name });
    setIsLoading(false);
  }, []);

  const onAuthError = useCallback((data: AuthErrorResponse) => {
    setError(data.reason);
    setIsLoading(false);
    setToken(null);
    db.clearSession();
  }, []);

  const onError = useCallback((data: ErrorResponse) => {
    setError(data.message);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    on('registered', onRegistered);
    on('auth-error', onAuthError);
    on('error', onError);

    // Tenta restaurar sessão
    db.getSession().then(session => {
      if (session) {
        setToken(session.token);
        // O servidor precisa validar esse token no registro
        // TODO: Implementar reconexão por token se necessário
      }
      setIsLoading(false);
    });

    return () => {
      off('registered', onRegistered);
      off('auth-error', onAuthError);
      off('error', onError);
    };
  }, [on, off, onRegistered, onAuthError, onError]);

  const logout = useCallback(() => {
    setToken(null);
    setName(null);
    db.clearSession();
  }, []);

  return {
    token,
    name,
    isAuthenticated: !!token,
    isLoading,
    error,
    authenticate,
    logout,
    wsStatus: status
  };
}
