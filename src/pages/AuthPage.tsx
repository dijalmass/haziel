import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PinInput } from "@/components/PinInput";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function AuthPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirectPath = searchParams.get("redirect") || "/connect";

  useEffect(() => {
    // Se já tivermos um PIN salvo, podemos tentar prosseguir
    // mas talvez o usuário queira trocar o PIN, então só redirecionamos
    // se o parâmetro 'auto' estiver presente ou se viermos de uma rota protegida
  }, []);

  const handleComplete = async (completedPin: string) => {
    setIsValidating(true);
    setError(null);

    try {
      // Salva o PIN localmente para uso nas páginas seguintes
      await db.savePreferences({ pin: completedPin });
      
      // Redireciona para o destino original
      navigate(redirectPath);
    } catch (err) {
      setError("Erro ao salvar preferências");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-100">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">
            Acesso Restrito
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Digite o PIN de 4 dígitos para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8">
          <PinInput
            value={pin}
            onChange={setPin}
            onComplete={handleComplete}
            disabled={isValidating}
            error={error}
          />
          
          <p className="mt-8 text-xs text-zinc-500">
            חזיאל — Haziel Camera System
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
