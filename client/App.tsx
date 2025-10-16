import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import Home from "./pages/Home";
import Pagamento from "./pages/Pagamento";
import Conta from "./pages/Conta";
import Sair from "./pages/Sair";
import NotFound from "./pages/NotFound";
import Extrato from "./pages/Extrato";
import Login from "./pages/Login";
import Cadastro_legal from "./pages/Cadastro_legal";
import Cadastro from "./pages/Cadastro";
import TipoConta from "./pages/TipoConta";
import { IndividualUserProvider, LegalEntityUserProvider } from "@/context/user";
import { TransactionsProvider } from "@/context/transactions";
import { SettingsProvider } from "@/context/settings";
import { useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/account/ProtectedRoute";

const queryClient = new QueryClient();

// Função auxiliar para ler do localStorage
const getStoredCredentials = (key: string) => {
  try {
    const stored = localStorage.getItem(key);
    // Garante que o retorno é { id: string, token: string }
    return stored ? JSON.parse(stored) : { id: "", token: "" };
  } catch {
    return { id: "", token: "" };
  }
};

const App = () => {
  // 1. Usa useState completo para permitir atualizações
  const [individualUser, setIndividualUser] = useState(getStoredCredentials("individualUser"));
  const [legalEntityUser, setLegalEntityUser] = useState(getStoredCredentials("legalEntityUser"));

  // 2. Função de callback que será chamada pelas telas de Login/Cadastro
  const handleAuthChange = useCallback(() => {
      // Re-lê os dados do localStorage e atualiza o estado, forçando a re-renderização
      setIndividualUser(getStoredCredentials("individualUser"));
      setLegalEntityUser(getStoredCredentials("legalEntityUser"));
  }, []);

  // 3. Verifica se está logado
  const isLoggedIn = !!individualUser.id || !!legalEntityUser.id;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SettingsProvider>
          {/* 3. FIX CRÍTICO: Adiciona a 'key' para forçar o remount (re-execução do useEffect) quando o ID mudar */}
          <IndividualUserProvider 
            userId={individualUser.id} 
            token={individualUser.token}
            key={`individual-${individualUser.id}`} 
          >
            <LegalEntityUserProvider 
              userId={legalEntityUser.id} 
              token={legalEntityUser.token}
              key={`legal-${legalEntityUser.id}`} 
            >
              <TransactionsProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-agipay-blue pb-20 md:pb-0">
                    <Navigation />
                    <Routes>
                      {/* As Props onLoginSuccess/onLogout são passadas aqui: */}
                      <Route path="/" element={<Login onLoginSuccess={handleAuthChange} />} />
                      <Route path="/home" element={
                        <ProtectedRoute isAuthenticated={isLoggedIn}>
                          <Home />
                        </ProtectedRoute>
                      } />
                      <Route path="/pagamento" element={
                        <ProtectedRoute isAuthenticated={isLoggedIn}>
                          <Pagamento />
                        </ProtectedRoute>
                      } />
                      <Route path="/conta" element={
                        <ProtectedRoute isAuthenticated={isLoggedIn}>
                          <Conta />
                        </ProtectedRoute>
                      } />
                      <Route path="/sair" element={
                        <ProtectedRoute isAuthenticated={isLoggedIn}>
                          <Sair onLogout={handleAuthChange} />
                        </ProtectedRoute>
                      } />
                      <Route path="/extrato" element={
                        <ProtectedRoute isAuthenticated={isLoggedIn}>
                          <Extrato />
                        </ProtectedRoute>
                      } />
                      {/* Rotas públicas */}
                      <Route path="/cadastro" element={<Cadastro onLoginSuccess={handleAuthChange} />} />
                      <Route path="/cadastro-legal" element={<Cadastro_legal onLoginSuccess={handleAuthChange} />} />
                      <Route path="/Tipo_conta" element={<TipoConta />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </BrowserRouter>
              </TransactionsProvider>
            </LegalEntityUserProvider>
          </IndividualUserProvider>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);

