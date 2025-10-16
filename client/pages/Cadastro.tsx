

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";



interface CadastroProps {
    onLoginSuccess: () => void;
}


export default function Cadastro({ onLoginSuccess }: CadastroProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
   
    if (!name.trim() || !email.trim() || !document.trim()) {
      toast({ title: "Preencha os dados básicos", variant: "destructive" as any });
      return;
    }
    if (!password) {
      toast({ title: "Defina uma senha", variant: "destructive" as any });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Senhas diferentes", description: "A confirmação deve ser igual.", variant: "destructive" as any });
      return;
    }
    

    const cpf = document.replace(/\D/g, "");
    const balance = 1000; 

    const dataToSend = {
      fullname: name.trim(),
      cpf,
      email: email.trim(),
      password,
      balance,
    };

    try {
      const response = await fetch("https://payment-platform-production-57a2.up.railway.app/auth/register-individual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        toast({ title: "Erro no cadastro", description: "Verifique os dados e tente novamente.", variant: "destructive" as any });
        return;
      }

      const userCreated = await response.json();

      if (userCreated && userCreated.token) {
        const userCredentials = { id: userCreated.id, token: userCreated.token };
        
        // Limpa credenciais antigas (boa prática)
        localStorage.removeItem("individualUser");
        localStorage.removeItem("legalEntityUser");
        
        
        localStorage.setItem("individualUser", JSON.stringify(userCredentials));
        
        
        onLoginSuccess();
        
        toast({ title: "Cadastro concluído", description: "Sua conta foi criada." });
        navigate("/");
      }
    } catch (e) {
    
      const errorMsg = e instanceof Error ? e.message : "Não foi possível conectar ao servidor.";
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
    }
  }

  return (
    <main className="flex-1">
      <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-8 lg:px-12">
        <div className="pt-16 md:pt-24 lg:pt-32">
          <div className="max-w-xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
              <h1 className="font-vilane text-2xl md:text-3xl font-normal mb-6">Criar conta</h1>

              <form onSubmit={onSubmit} autoComplete="off" className="space-y-6">
                {/* Dados básicos */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-white" htmlFor="name">Nome completo</label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white text-black placeholder:text-black/60" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white" htmlFor="email">E-mail</label>
                    <Input id="email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white text-black placeholder:text-black/60" placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white" htmlFor="document">CPF</label>
                    <Input id="document" inputMode="numeric" autoComplete="off" value={document} onChange={(e) => setDocument(e.target.value)} className="bg-white text-black placeholder:text-black/60" placeholder="000.000.000-00" />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-4">
                  <h2 className="font-vilane text-xl">Senha</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white" htmlFor="password">Senha</label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white text-black" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white" htmlFor="confirm">Confirmar senha</label>
                      <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-white text-black" placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-agipay-dark-blue text-white rounded-full py-3 text-lg font-vilane">Criar conta</Button>
              </form>

              <p className="text-white/80 text-sm mt-6 text-center">
                Já tem conta? <Link to="/" className="underline">Entrar</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// mantendo a função formatDocument, embora não esteja sendo usada no estado atual do componente
function formatDocument(v: string) {
  const digits = v.replace(/\D/g, "");
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}