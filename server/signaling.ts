import type { ServerWebSocket } from "bun";
import type { ClientMessage, ServerMessage, WsData } from "./types";
import { registry } from "./device-registry";
import { validatePin, generateToken, isValidToken, revokeToken } from "./auth";

export function handleMessage(ws: ServerWebSocket<WsData>, message: string | Buffer) {
  try {
    const data: ClientMessage = JSON.parse(message.toString());

    switch (data.type) {
      case 'register':
        handleRegister(ws, data);
        break;
      case 'view':
        handleView(ws, data);
        break;
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        handleRelay(ws, data);
        break;
      case 'heartbeat':
        handleHeartbeat(ws);
        break;
      case 'disconnect':
        ws.close();
        break;
      default:
        sendError(ws, 'UNKNOWN_TYPE', 'Tipo de mensagem desconhecido');
    }
  } catch (err) {
    sendError(ws, 'INVALID_JSON', 'Mensagem JSON inválida');
  }
}

function handleRegister(ws: ServerWebSocket<WsData>, data: { name: string; pin: string }) {
  if (!validatePin(data.pin)) {
    ws.send(JSON.stringify({ type: 'auth-error', reason: 'PIN inválido' }));
    return;
  }

  if (registry.isNameTaken(data.name)) {
    sendError(ws, 'NAME_TAKEN', 'Este nome já está em uso');
    return;
  }

  const token = generateToken();
  ws.data.type = 'sender';
  ws.data.name = data.name;
  ws.data.token = token;

  const success = registry.register(data.name, {
    name: data.name,
    ws,
    status: 'online',
    token,
    registeredAt: Date.now(),
    lastHeartbeat: Date.now()
  });

  if (!success) {
    sendError(ws, 'REGISTRY_FULL', 'Limite de dispositivos atingido');
    return;
  }

  ws.send(JSON.stringify({ type: 'registered', token, name: data.name }));
  
  // Broadcast que um novo dispositivo está online
  ws.publish('events', JSON.stringify({ type: 'device-online', name: data.name }));
}

function handleView(ws: ServerWebSocket<WsData>, data: { name: string; pin: string }) {
  if (!validatePin(data.pin)) {
    ws.send(JSON.stringify({ type: 'auth-error', reason: 'PIN inválido' }));
    return;
  }

  const device = registry.getDevice(data.name);
  if (!device) {
    sendError(ws, 'DEVICE_OFFLINE', 'Dispositivo não encontrado ou offline');
    return;
  }

  ws.data.type = 'viewer';
  ws.data.viewTarget = data.name;
  
  // Notifica o sender que um viewer entrou
  const viewerId = crypto.randomUUID();
  ws.data.viewerId = viewerId;
  
  // O viewer se inscreve no tópico do dispositivo para receber broadcasts (como offline/online)
  // E no seu próprio tópico privado para receber offers/candidates específicos
  ws.subscribe(`device:${data.name}`);
  ws.subscribe(`viewer:${viewerId}`);

  device.ws.send(JSON.stringify({ type: 'viewer-joined', viewerId }));
}

function handleRelay(ws: ServerWebSocket<WsData>, data: any) {
  // Apenas roteia a mensagem para o alvo correto
  if (ws.data.type === 'sender') {
    // Sender → Viewer relay
    // Se a mensagem tiver viewerId, envia apenas para aquele viewer
    if (data.viewerId) {
      ws.publish(`viewer:${data.viewerId}`, JSON.stringify(data));
    } else {
      // Caso contrário, broadcast para todos os viewers do dispositivo
      ws.publish(`device:${ws.data.name}`, JSON.stringify(data));
    }
  } else if (ws.data.type === 'viewer' && ws.data.viewTarget) {
    // Viewer → Sender relay
    const device = registry.getDevice(ws.data.viewTarget);
    if (device) {
      // Inclui o viewerId na mensagem para o sender saber de quem veio
      const enrichedData = { ...data, viewerId: ws.data.viewerId };
      device.ws.send(JSON.stringify(enrichedData));
    }
  }
}

function handleHeartbeat(ws: ServerWebSocket<WsData>) {
  if (ws.data.type === 'sender' && ws.data.name) {
    registry.updateHeartbeat(ws.data.name);
  }
}

function sendError(ws: ServerWebSocket<WsData>, code: string, message: string) {
  ws.send(JSON.stringify({ type: 'error', code, message }));
}

export function handleClose(ws: ServerWebSocket<WsData>) {
  if (ws.data.type === 'sender' && ws.data.name) {
    registry.unregister(ws.data.name);
    if (ws.data.token) revokeToken(ws.data.token);
    ws.publish('events', JSON.stringify({ type: 'device-offline', name: ws.data.name }));
  }
}
