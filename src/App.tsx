import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ConnectPage from './pages/ConnectPage';
import ViewerPage from './pages/ViewerPage';
import AdminPage from './pages/AdminPage';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { Aperture, Video, Settings, LayoutDashboard } from 'lucide-react';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6 text-center relative overflow-hidden">
      {/* Background elegant effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        <div className="mb-8 p-5 bg-zinc-900/30 rounded-full border border-white/5 shadow-2xl backdrop-blur-xl flex items-center justify-center">
          <Aperture className="w-12 h-12 text-white/90" strokeWidth={1} />
        </div>
        <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter mb-4 select-none">
          חזיאל
        </h1>
        <p className="text-zinc-400 font-medium tracking-[0.3em] uppercase text-sm md:text-base select-none">
          A quem Deus vê
        </p>
      </div>
      
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 ease-out fill-mode-both">
        <Link 
          to="/connect" 
          className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-zinc-900/40 border border-white/10 rounded-[2rem] hover:bg-white hover:border-white transition-all duration-500 shadow-xl shadow-black/50 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Video className="w-8 h-8 text-zinc-300 group-hover:text-black transition-colors duration-500" strokeWidth={1.5} />
          <span className="font-semibold text-zinc-300 group-hover:text-black transition-colors duration-500 tracking-wide">Transmitir</span>
        </Link>

        <Link 
          to="/auth" 
          className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-zinc-900/40 border border-white/5 rounded-[2rem] hover:bg-zinc-800/80 hover:border-white/20 transition-all duration-500 shadow-xl shadow-black/50 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <Settings className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
          <span className="font-semibold text-zinc-400 group-hover:text-white transition-colors duration-500 tracking-wide">Configurar PIN</span>
        </Link>

        <Link 
          to="/admin" 
          className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-zinc-900/40 border border-white/5 rounded-[2rem] hover:bg-zinc-800/80 hover:border-white/20 transition-all duration-500 shadow-xl shadow-black/50 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <LayoutDashboard className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
          <span className="font-semibold text-zinc-400 group-hover:text-white transition-colors duration-500 tracking-wide">Admin</span>
        </Link>
      </div>

      <footer className="absolute bottom-10 text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium opacity-50 select-none">
        Haziel — Professional Camera Streaming
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
