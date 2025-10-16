// Arquivo: user.tsx

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

// -----------------------------------------------------------------
// TIPOS DE DADOS
// -----------------------------------------------------------------

export type Address = {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
};

export type IndividualUser = {
    fullname: string;
    email: string;
    id: string;
    balance: number;
    phone: string;
    token?: string; // Token de autenticação
    document: string; // CPF
    birthDate: string; // YYYY-MM-DD
    address: Address;
};

export type LegalEntityUser = {
    legalName: string;
    email: string;
    id: string;
    balance: number;
    phone: string;
    token?: string; // Token de autenticação
    document: string; // CNPJ
    address: Address;
};

// -----------------------------------------------------------------
// CONTEXTO E PROVIDER PARA INDIVIDUAL USER (PESSOA FÍSICA)
// -----------------------------------------------------------------

export type IndividualUserContextValue = {
    user: IndividualUser | null;
    updateUser: (patch: Partial<IndividualUser>) => void;
    loading: boolean;
};

const IndividualUserContext = createContext<IndividualUserContextValue | null>(null);

export function IndividualUserProvider({ children, userId, token }: { children: ReactNode; userId: string; token: string }) {
    const [user, setUser] = useState<IndividualUser | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true; // Para evitar memory leaks

        async function fetchUser() {
            setLoading(true);
            try {
                const response = await fetch(`https://payment-platform-production-57a2.up.railway.app/individual/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (isMounted) {
                    if (response.ok) {
                        const data = await response.json();
                        if (data && typeof data === 'object') {
                            // CORREÇÃO CRÍTICA: Adiciona o token ao objeto user para uso posterior
                            setUser({ ...data, token: token }); 
                        } else {
                            setUser(null);
                        }
                    } else {
                        setUser(null);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Erro ao buscar usuário individual:", error);
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        
        if (userId && token) {
            fetchUser();
        } else {
            // Se não houver dados, garante que o estado inicial é limpo
            setUser(null);
            setLoading(false);
        }

        return () => { // Função de limpeza para evitar erro em componentes desmontados
            isMounted = false;
        };
    }, [userId, token]);

    // Atualiza o usuário no banco de dados
    const updateUser = async (patch: Partial<IndividualUser>) => {
        if (!userId || !token) return;
        try {
            const response = await fetch(`https://payment-platform-production-57a2.up.railway.app/individual/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(patch),
            });
            if (response.ok) {
                const updated = await response.json();
                if (updated && typeof updated === 'object') {
                    // Mantém o token na atualização
                    setUser({ ...updated, token: token });
                }
            }
        } catch {}
    };

    const value = useMemo(() => ({ user, updateUser, loading }), [user, loading]);
    return <IndividualUserContext.Provider value={value}>{children}</IndividualUserContext.Provider>;
}

export function useIndividualUser() {
    const ctx = useContext(IndividualUserContext);
    if (!ctx) throw new Error("useIndividualUser deve ser usado dentro de IndividualUserProvider");
    return ctx;
}

// -----------------------------------------------------------------
// CONTEXTO E PROVIDER PARA LEGAL ENTITY USER (PESSOA JURÍDICA)
// -----------------------------------------------------------------

export type LegalEntityUserContextValue = {
    user: LegalEntityUser | null;
    updateUser: (patch: Partial<LegalEntityUser>) => void;
    loading: boolean;
};

const LegalEntityUserContext = createContext<LegalEntityUserContextValue | null>(null);

export function LegalEntityUserProvider({ children, userId, token }: { children: ReactNode; userId: string; token: string }) {
    const [user, setUser] = useState<LegalEntityUser | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true; // Para evitar memory leaks

        async function fetchUser() {
            setLoading(true);
            try {
                const response = await fetch(`https://payment-platform-production-57a2.up.railway.app/LegalEntity/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (isMounted) {
                    if (response.ok) {
                        const data = await response.json();
                        if (data && typeof data === 'object') {
                            // CORREÇÃO CRÍTICA: Adiciona o token ao objeto user para uso posterior
                            setUser({ ...data, token: token });
                        } else {
                            setUser(null);
                        }
                    } else {
                        setUser(null);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Erro ao buscar usuário pessoa jurídica:", error);
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (userId && token) {
            fetchUser();
        } else {
            setUser(null);
            setLoading(false);
        }

        return () => { // Função de limpeza para evitar erro em componentes desmontados
            isMounted = false;
        };
    }, [userId, token]);

    // Atualiza o usuário no banco de dados
    const updateUser = async (patch: Partial<LegalEntityUser>) => {
        if (!userId || !token) return;
        try {
            const response = await fetch(`https://payment-platform-production-57a2.up.railway.app/LegalEntity/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(patch),
            });
            if (response.ok) {
                const updated = await response.json();
                if (updated && typeof updated === 'object') {
                    // Mantém o token na atualização
                    setUser({ ...updated, token: token });
                }
            }
        } catch {}
    };

    const value = useMemo(() => ({ user, updateUser, loading }), [user, loading]);
    
    // CORREÇÃO DE SINTAXE: LegalEntityUserContext.Provider
    return <LegalEntityUserContext.Provider value={value}>{children}</LegalEntityUserContext.Provider>;
}

export function useLegalEntityUser() {
    const ctx = useContext(LegalEntityUserContext);
    if (!ctx) throw new Error("useLegalEntityUser deve ser usado dentro de LegalEntityUserProvider");
    return ctx;
}