// ARQUIVO: client/pages/Conta.tsx (ou onde sua página Conta está)

import { PersonalDataForm } from "@/components/account/PersonalDataForm";
import { NotificationsForm } from "@/components/account/NotificationsForm"; 
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useIndividualUser, useLegalEntityUser, IndividualUser, LegalEntityUser } from "@/context/user"; 
// <--- NOVO IMPORT DO ENDEREÇO

// Hook para retornar o usuário correto
function useUser() {
    const individual = useIndividualUser();
    const legalEntity = useLegalEntityUser();

    // 1. Definições de objetos padrão para garantir a coerência do tipo
    const defaultAddress = { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip: "" };
    
    // Usamos o tipo IndividualUser como base para o usuário padrão, 
    // preenchendo todas as propriedades obrigatórias com valores vazios/default.
    const defaultIndividualUser: IndividualUser = {
        fullname: "",
        email: "",
        id: "",
        balance: 0,
        phone: "",
        document: "",
        birthDate: "",
        address: defaultAddress,
        token: "", // Incluir token para segurança de tipagem, se necessário
    };
    
    // Retornamos o tipo LegalEntityUser para satisfazer o contrato, se necessário.
    // O mais importante é que todas as chaves obrigatórias estejam presentes.
    const defaultLegalEntityUser: LegalEntityUser = {
        legalName: "",
        email: "",
        id: "",
        balance: 0,
        phone: "",
        document: "",
        address: defaultAddress,
        token: "",
    };

    if (individual && individual.user) {
        return individual;
    }
    if (legalEntity && legalEntity.user) {
        return legalEntity;
    }
    

    // 2. CORREÇÃO: Retorna o objeto completo para satisfazer a tipagem.
    // O TypeScript agora aceitará 'user' como (IndividualUser | LegalEntityUser) no componente Conta.
    return { 
        user: defaultIndividualUser, // Usamos o IndividualUser, pois ele cobre a maioria das props
        updateUser: (patch: any) => { console.warn("Tentativa de update sem usuário logado. Patch ignorado."); }
    };
}

export default function Conta() {
  const { user, updateUser } = useUser();

  // Se o usuário PF estiver logado, ele terá 'fullname'
  // Se o usuário PJ estiver logado, ele terá 'legalName'
  
  const name = (user as IndividualUser).fullname || (user as LegalEntityUser).legalName || 'Usuário';

  return (
    <main className="flex-1">
      <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-8 lg:px-12">
        <div className="pt-16 md:pt-24 lg:pt-32">
          <h1 className="font-vilane text-3xl md:text-4xl lg:text-5xl font-normal text-white mb-8 text-center">
            Minha Conta
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dados Pessoais */}
            <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h2 className="font-vilane text-2xl mb-2">Dados Pessoais</h2>
              <p className="text-white/80 mb-4">Nome, email, CPF/CNPJ</p>
              <PersonalDataForm user={user} updateUser={updateUser} />
            </section>

          
           
          </div>

          <div className="max-w-3xl mx-auto mt-8 text-center text-white/60 text-sm">
            <Separator className="my-6 bg-white/20" />
           
          </div>
        </div>
      </div>
    </main>
  );
}