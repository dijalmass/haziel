# Haziel — Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.3.0] - 2026-04-18

### Adicionado (Etapa 3 — Páginas e Estabilização)
- **Páginas e Navegação**:
  - `AuthPage` com entrada de PIN estilizada e autenticação persistente.
  - `ConnectPage` (Sender) com seletor de câmera, qualidade e controle de streaming.
  - `ViewerPage` (Viewer) com modo OBS Browser Source (`?obs=true`) e auto-auth (`?pin=XXXX`).
- **Melhorias de Performance e Qualidade**:
  - Forçado bitrate de **10 Mbps** nas conexões WebRTC para eliminar artefatos de compressão em rede local.
  - Adicionado suporte a **Fullscreen** no preview do dispositivo para melhor visualização.
  - Implementação da **Screen Wake Lock API** para impedir que a tela do celular apague durante a transmissão.
- **Estabilidade e Conectividade**:
  - Criação do `WebSocketProvider` para compartilhamento de conexão única entre múltiplos hooks.
  - Sistema de **Auto-Reconexão Inteligente**: o Viewer detecta quando o Sender volta a ficar online e restabelece o stream automaticamente.
  - Limpeza de frames congelados ao detectar queda de conexão ou parada manual.
  - Suporte a **HTTPS (SSL)** via `basic-ssl` no Vite para permitir acesso às APIs de mídia em dispositivos móveis.

### Corrigido
- Problema de espelhamento horizontal no preview da câmera (agora desativado por padrão para câmeras traseiras).
- Conflito de múltiplas instâncias de WebSocket que causava falhas na sinalização WebRTC.
- Erro `TypeError: enumerateDevices is undefined` em contextos não seguros (HTTP).

---

## [0.2.0] - 2026-04-17

### Adicionado (Etapa 2 — Hooks Core + Persistência + UI Base)
- **Infraestrutura Base**:
  - `src/lib/constants.ts` com configurações de rede, WebRTC e presets de qualidade.
  - `src/lib/signaling.ts` com protocolo de mensagens client-side tipado.
  - `src/lib/db.ts` para persistência via IndexedDB (Dexie.js).
- **Hooks de Lógica**:
  - `useWebSocket` com reconexão automática e heartbeat.
  - `useAuth` para gerenciamento de sessão persistente.
  - `useCamera` para captura de vídeo e seleção de dispositivos.
  - `useWebRTC` para orquestração de conexões P2P (Sender/Viewer).
- **Componentes de UI**:
  - Implementação manual de componentes shadcn/ui (`Button`, `Input`, `Badge`, `Card`, `InputOTP`, `Skeleton`).
  - Componentes customizados: `PinInput`, `CameraPreview`, `DeviceStatus` e `VideoPlayer`.
- **Servidor**:
  - Suporte a `viewerId` no sinalizador para permitir múltiplos espectadores por câmera.

---

## [0.1.0] - 2026-04-17

### Adicionado (Etapa 1 — Fundação e Servidor)
- Setup inicial do projeto com Bun, React 19, Vite e Tailwind CSS v4.
- Configuração de `shadcn/ui` e `lucide-react`.
- Servidor de sinalização Bun WebSocket em `server/index.ts`.
- Registro de dispositivos in-memory em `server/device-registry.ts`.
- Sistema de autenticação por PIN em `server/auth.ts`.
- Arquitetura detalhada do sistema no `implementation_plan.md`.
