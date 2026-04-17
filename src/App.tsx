import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4 tracking-tight">Haziel</h1>
      <p className="text-zinc-400 mb-8">חזיאל — "A quem Deus vê"</p>
      
      <div className="flex gap-4">
        <Link 
          to="/connect" 
          className="px-6 py-2 bg-zinc-100 text-zinc-950 rounded-md font-medium hover:bg-zinc-200 transition-colors"
        >
          Conectar Câmera
        </Link>
        <Link 
          to="/view/test" 
          className="px-6 py-2 border border-zinc-800 rounded-md font-medium hover:bg-zinc-900 transition-colors"
        >
          Ver Stream (Teste)
        </Link>
      </div>
    </div>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <Link to="/" className="text-blue-400 hover:underline">Voltar para Home</Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connect" element={<Placeholder title="Página de Conexão (TODO)" />} />
        <Route path="/view/:name" element={<Placeholder title="Visualizador de Câmera (TODO)" />} />
      </Routes>
    </BrowserRouter>
  )
}
