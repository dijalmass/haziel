# Haziel — Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Planejado (Etapa 3 — Páginas e Integração Final)
- Criação de `AuthPage` com entrada de PIN e autenticação baseada em sessão.
- Criação de `ConnectPage` com interface de streaming (Sender) e controles de câmera.
- Criação de `ViewerPage` para exibição de vídeo WebRTC (Viewer) e modo OBS Browser Source.
- Atualização do `App.tsx` integrando as novas páginas e finalizando os roteamentos placeholders.
- Testes manuais do fluxo completo ponta-a-ponta (Device -> Server -> OBS).

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
