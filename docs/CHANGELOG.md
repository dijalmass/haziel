# Haziel — Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Adicionado
- Documentação inicial do projeto (README, implementation plan, changelog)
- Plano de implementação completo com arquitetura WebRTC

### Planejado
- Servidor Bun com WebSocket para sinalização WebRTC
- Frontend React + Vite + shadcn/ui
- Autenticação por PIN de 4 dígitos
- Página de sender (conectar câmera e transmitir)
- Página de viewer (receber stream, compatível com OBS Browser Source)
- Persistência de sessão e preferências via IndexedDB (Dexie.js)
- Reconexão automática com timeout de 3 minutos
- Suporte a até 10 dispositivos simultâneos
