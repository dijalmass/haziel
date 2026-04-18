import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ConnectPage from './pages/ConnectPage';
import ViewerPage from './pages/ViewerPage';
import AdminPage from './pages/AdminPage';
import { WebSocketProvider } from './providers/WebSocketProvider';

function Home() {
  // Simples redirecionamento para o fluxo de conexão ou viewer
  // Por enquanto deixaremos uma landing minimalista
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4 text-center">
      <div className="mb-8 p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 animate-in fade-in zoom-in duration-700">
        <h1 className="text-6xl font-black text-white tracking-tighter mb-2">חזיאל</h1>
        <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">A quem Deus vê</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <a 
          href="/connect" 
          className="flex-1 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-white/5 active:scale-95"
        >
          Transmitir
        </a>
        <a 
          href="/auth" 
          className="flex-1 px-8 py-4 bg-zinc-900 text-white border border-zinc-800 rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-95"
        >
          Configurar PIN
        </a>
        <a 
          href="/admin" 
          className="flex-1 px-8 py-4 bg-zinc-900 text-white border border-zinc-800 rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-95"
        >
          Admin
        </a>
      </div>

      <footer className="mt-20 text-[10px] text-zinc-700 uppercase tracking-[0.2em] font-bold">
        Haziel — Professional Camera Streaming for OBS
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/connect" element={<ConnectPage />} />
          <Route path="/view/:name" element={<ViewerPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </WebSocketProvider>
    </BrowserRouter>
  );
}
