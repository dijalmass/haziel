import { useWebSocketContext } from '../providers/WebSocketProvider';

export type { WSStatus } from '../providers/WebSocketProvider';

export function useWebSocket() {
  return useWebSocketContext();
}
