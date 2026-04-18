# 👁️ Haziel

> **חזיאל** — *"A quem Deus vê"* · *"Visão de Deus"*

Transforme qualquer celular na rede local em uma câmera de alta qualidade para o OBS Studio.

Haziel é uma aplicação web que permite conectar dispositivos (celulares, tablets, webcams) na mesma rede local e streamar suas câmeras diretamente para o OBS via **Browser Source** — sem instalar nada nos dispositivos, sem nuvem, sem latência.

---

## ✨ Features

- 🎥 **Streaming WebRTC P2P** — vídeo em alta qualidade direto entre dispositivo e OBS, sem passar pelo servidor
- 📱 **Câmera do celular como fonte** — abra no navegador, permita a câmera e pronto
- 🎬 **Integração nativa com OBS** — adicione como Browser Source com uma URL
- 🔐 **Proteção por PIN** — acesso controlado por PIN de 4 dígitos
- 🔄 **Reconexão automática** — se o dispositivo cair, tenta reconectar por 3 minutos
- 📊 **Até 10 dispositivos** — múltiplas câmeras simultâneas
- 🌐 **Zero instalação** — funciona no navegador de qualquer dispositivo na rede
- 🎚️ **Seleção de qualidade** — 4K, 1080p, 720p ou automático

---

## 🏗️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | [Bun](https://bun.sh) |
| Frontend | [React 19](https://react.dev) + [Vite](https://vite.dev) |
| UI | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| Streaming | [WebRTC](https://webrtc.org) |
| Signaling | Bun WebSocket (nativo) |
| Persistência | IndexedDB via [Dexie.js](https://dexie.org) |

---

## 🚀 Quick Start

### Pré-requisitos

- [Bun](https://bun.sh) instalado (`curl -fsSL https://bun.sh/install | bash`)
- Dispositivos na mesma rede Wi-Fi

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/dijalmass/haziel.git
cd haziel

# Instalar dependências
bun install

# Configurar PIN (opcional, padrão: 1234)
cp .env.example .env
# Edite o .env e defina CAM_PIN=seu_pin
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento (frontend + signaling)
bun run dev:all
```

### Produção

```bash
# Build do frontend
bun run build

# Iniciar servidor de produção
bun run start
```

O servidor estará disponível em `http://{SEU_IP_LOCAL}:3000`.

---

### ⚠️ Importante: HTTPS Necessário
Para que os navegadores permitam o acesso à câmera e microfone em dispositivos móveis, a aplicação **deve** ser acessada via HTTPS. O projeto já vem configurado com um certificado auto-assinado para desenvolvimento.

Ao acessar `https://{SEU_IP_LOCAL}:5173`, seu navegador mostrará um aviso de segurança. Clique em **"Avançado"** e **"Prosseguir para {IP} (não seguro)"** para continuar.

### 1. Conectar um dispositivo (celular)

1. No celular, abra o navegador e acesse `https://{IP_DO_SERVIDOR}:5173`
2. Digite o PIN de 4 dígitos
3. Defina um nome para o dispositivo (ex: `S22-Ultra`)
4. Selecione a câmera e a qualidade desejada
5. Toque em **"Iniciar Transmissão"**

### 2. Adicionar no OBS

1. No OBS, clique em **Sources → + → Browser Source**
2. Na URL, coloque:
   ```
   https://{IP_DO_SERVIDOR}:5173/view/{nome-do-dispositivo}?pin=1234&obs=true
   ```
3. Configure a resolução desejada (ex: 1920x1080)
4. Clique em **OK** — o vídeo aparecerá na cena

### Parâmetros da URL

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `pin` | Autenticação automática (sem tela de login) | `?pin=1234` |
| `obs` | Modo OBS: remove toda a UI, apenas vídeo | `&obs=true` |

---

## ⚙️ Configuração

Variáveis de ambiente (`.env`):

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `CAM_PIN` | PIN de 4 dígitos para autenticação | `1234` |
| `PORT` | Porta do servidor | `3000` |

---

## 🏛️ Arquitetura

```
Celular A ──┐                              ┌── OBS (Browser Source /view/cam-a)
Celular B ──┤── WebSocket ── Bun Server ── ┤── OBS (Browser Source /view/cam-b)
Celular C ──┘   (signaling)  :3000         └── OBS (Browser Source /view/cam-c)
                    │
            ┌───────┴───────┐
            │ Apenas troca  │
            │ de SDP/ICE    │
            │ (sinalização) │
            └───────────────┘
                    
Celular A ═══════════════════════════════════ OBS cam-a
Celular B ═══════════════════════════════════ OBS cam-b
           ↑ WebRTC P2P (vídeo direto) ↑
```

- **O vídeo nunca passa pelo servidor** — é peer-to-peer direto
- **O servidor só orquestra a conexão** — troca de offers, answers e ICE candidates
- **Latência mínima** — conexão direta na rede local

---

## 📁 Estrutura do Projeto

```
haziel/
├── server/                  # Servidor Bun (signaling WebRTC)
│   ├── index.ts             # Entry point
│   ├── signaling.ts         # WebSocket handlers
│   ├── device-registry.ts   # Registro de dispositivos
│   └── auth.ts              # Validação do PIN
├── src/                     # Frontend React
│   ├── pages/               # Páginas da aplicação
│   ├── components/          # Componentes UI
│   ├── hooks/               # Hooks customizados (WebRTC, câmera, etc.)
│   └── lib/                 # Utilitários e persistência
├── docs/                    # Documentação
│   ├── implementation_plan.md
│   └── CHANGELOG.md
└── README.md
```

---

## ⚡ Otimizações de Performance

- **Bitrate Forçado (10 Mbps)**: Garantimos que o WebRTC utilize a banda da sua rede local para transmitir em alta fidelidade.
- **Screen Wake Lock**: O dispositivo não apaga a tela enquanto estiver transmitindo.
- **Auto-Reconexão**: O Viewer detecta automaticamente quando o dispositivo volta a ficar online e restabelece o stream sem F5.

---

## 🗺️ Roadmap

- [x] Documentação e planejamento
- [x] Servidor de sinalização WebRTC (Bun)
- [x] Frontend: autenticação por PIN
- [x] Frontend: página de conexão (sender)
- [x] Frontend: página de viewer (para OBS)
- [x] Reconexão automática com timeout
- [x] Suporte a HTTPS (SSL Local)
- [x] Bitrate de Alta Performance (10Mbps)
- [x] Screen Wake Lock (Tela sempre ativa)
- [ ] Dashboard admin (v2)
- [ ] Suporte a áudio opcional (v2)
- [ ] Gravação local de streams (v2)

---

## 📄 Licença

GPL-3.0 © [Dijalmass](https://github.com/dijalmass)
