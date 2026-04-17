import { handleMessage, handleClose } from "./signaling";
import type { WsData } from "./types";

const PORT = Number(process.env.PORT) || 3001;

const server = Bun.serve<WsData>({
  port: PORT,
  hostname: "0.0.0.0",

  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      const success = server.upgrade(req, {
        data: { type: 'unknown' }
      });
      if (success) return undefined;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    return new Response("Haziel Signaling Server is running", { status: 200 });
  },

  websocket: {
    idleTimeout: 120, // 2 minutes
    maxPayloadLength: 64 * 1024, // 64KB

    open(ws) {
      console.log(`[WS] Connection opened`);
      ws.subscribe("events");
    },

    message(ws, message) {
      handleMessage(ws, message);
    },

    close(ws) {
      console.log(`[WS] Connection closed`);
      handleClose(ws);
    },
  },
});

console.log(`🔌 Haziel signaling server running on http://0.0.0.0:${PORT}`);
