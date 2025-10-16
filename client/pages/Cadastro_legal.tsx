// pages/Cadastro_legal.tsx (CORRIGIDO)

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
// Não é mais necessário importar useLegalEntityUser, pois o App.tsx fará o carregamento.
// import { useLegalEntityUser } from "@/context/user"; 

// 1. Define a interface para a nova prop
interface CadastroLegalProps {
    onLoginSuccess: () => void;
}

// 2. O componente agora aceita a prop
export default function CadastroLegalEntity({ onLoginSuccess }: CadastroLegalProps) {
    // const { updateUser } = useLegalEntityUser(); // Removido, pois não é o fluxo correto para cadastro inicial
    const { toast } = useToast();
    const navigate = useNavigate();

    const [legalName, setLegalName] = useState("");
    const [email, setEmail] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [balance] = useState("0"); // Simplificado, valor fixo

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        // --- Validações ---
        if (!legalName.trim() || !email.trim() || !cnpj.trim()) {
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
        // ------------------

        const cnpjDigits = cnpj.replace(/\D/g, "");
        const balanceNumber = 0;

        const dataToSend = {
            legalName: legalName.trim(),
            cnpj: cnpjDigits,
            email: email.trim(),
            password,
            balance: balanceNumber,
        };

        try {
            const response = await fetch("https://payment-platform-production-57a2.up.railway.app/auth/register-legalentity", {
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
                
                // 3. AÇÃO CRÍTICA: Salva as credenciais da Pessoa Jurídica no localStorage
                localStorage.setItem("legalEntityUser", JSON.stringify(userCredentials));
                
                // 4. CHAMA O CALLBACK: Notifica o App.tsx para recarregar o estado
                onLoginSuccess();

                toast({ title: "Cadastro concluído", description: "Sua conta jurídica foi criada." });
                navigate("/");
            } else {
                toast({ title: "Erro de servidor", description: "Cadastro realizado, mas o token de autenticação não foi retornado.", variant: "destructive" as any });
            }
        } catch (error) {
            toast({ title: "Erro de conexão", description: "Não foi possível conectar ao servidor.", variant: "destructive" as any });
        }
    }

    return (
        <main className="flex-1">
            <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-8 lg:px-12">
                <div className="pt-16 md:pt-24 lg:pt-32">
                    <div className="max-w-xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
                            <h1 className="font-vilane text-2xl md:text-3xl font-normal mb-6">Criar conta jurídica</h1>
                            <form onSubmit={onSubmit} autoComplete="off" className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-white" htmlFor="legalName">Razão Social</label>
                                        <Input id="legalName" value={legalName} onChange={(e) => setLegalName(e.target.value)} className="bg-white text-black placeholder:text-black/60" placeholder="Nome da empresa" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-white" htmlFor="email">E-mail</label>
                                        <Input id="email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white text-black placeholder:text-black/60" placeholder="contato@empresa.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-white" htmlFor="cnpj">CNPJ</label>
                                        <Input id="cnpj" inputMode="numeric" autoComplete="off" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="bg-white text-black placeholder:text-black/60" placeholder="00.000.000/0001-00" />
                                    </div>

                                </div>
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