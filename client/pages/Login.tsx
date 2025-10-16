import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Interface para props
interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("https://payment-platform-production-57a2.up.railway.app/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        toast({
          title: "Credenciais inválidas",
          description: "Verifique e-mail e senha.",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      const userCredentials = { id: data.userId, token: data.token };

      // Limpa credenciais antigas
      localStorage.removeItem("individualUser");
      localStorage.removeItem("legalEntityUser");

      let userType = null;

      // Verifica tipo de usuário: individual
      let userResponse = await fetch(`https://payment-platform-production-57a2.up.railway.app/individual/${data.userId}`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      if (userResponse.ok) {
        userType = "individual";
        localStorage.setItem("individualUser", JSON.stringify(userCredentials));
      } else {
        // Se falhar, tenta legal entity
        userResponse = await fetch(`https://payment-platform-production-57a2.up.railway.app/LegalEntity/${data.userId}`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (userResponse.ok) {
          userType = "legalEntity";
          localStorage.setItem("legalEntityUser", JSON.stringify(userCredentials));
        }
      }

      if (!userType) {
        toast({
          title: "Erro ao buscar dados do usuário",
          description: "O servidor não retornou os dados de PF ou PJ.",
          variant: "destructive",
        });
        return;
      }

      // Notifica App sobre login
      onLoginSuccess();
      toast({ title: "Login realizado", description: "Bem-vindo de volta!" });
      navigate("/home");

    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  }

  return (
    <main className="flex-1">
      <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-8 lg:px-12">
        <div className="mt-16 md:mt-24 lg:mt-32">
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h1 className="font-vilane text-3xl md:text-10xl lg:text-400xl font-normal text-white">Login</h1>

              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-white" htmlFor="email">E-mail</label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    className="bg-white text-black placeholder:text-black/60"
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white" htmlFor="password">Senha</label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white text-black placeholder:text-black/60"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-agipay-dark-blue text-white rounded-full py-3 text-lg font-vilane"
                >
                  Entrar
                </Button>
              </form>

              <p className="text-white/80 text-sm mt-6 text-center">
                Não tem conta? <Link to="/Tipo_conta" className="underline">Cadastre-se</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
