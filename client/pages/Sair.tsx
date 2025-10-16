// pages/Sair.tsx (CORRIGIDO)

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// 1. Define a interface para a nova prop onLogout
interface LogoutProps {
    onLogout: () => void;
}

// 2. O componente agora aceita a prop
export default function Sair({ onLogout }: LogoutProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        // 3. IMPLEMENTAÇÃO CRÍTICA: Limpa as credenciais do localStorage
        localStorage.removeItem("individualUser");
        localStorage.removeItem("legalEntityUser");
        
        // 4. CHAMA O CALLBACK: Notifica o App.tsx para atualizar os Providers
        onLogout(); 
        
        // 5. Redireciona para a tela inicial (Login)
        navigate("/", { replace: true });
    };

    const handleCancel = () => {
        navigate(-1); // Volta para a página anterior
    };

    return (
        <main className="flex-1">
            <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-8 lg:px-12">
                <div className="pt-16 md:pt-24 lg:pt-32">
                    <div className="max-w-md mx-auto text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
                            <h1 className="font-vilane text-2xl md:text-3xl font-normal mb-6">
                                Sair da Conta
                            </h1>
                            
                            <p className="text-white/80 mb-8">
                                Tem certeza de que deseja sair da sua conta?
                            </p>

                            <div className="space-y-4">
                                <Button
                                    onClick={handleLogout} // Chama a nova lógica de Logout
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-vilane text-lg py-3 rounded-full transition-colors"
                                >
                                    Sim, sair
                                </Button>
                                
                                <Button
                                    onClick={handleCancel}
                                    variant="secondary"
                                    className="w-full bg-white text-black font-vilane text-lg py-3 rounded-full hover:bg-white/90 transition-colors"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-white/60 text-sm">
                                Você pode fazer login novamente a qualquer momento
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}