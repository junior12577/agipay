import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIndividualUser,  useLegalEntityUser  } from "@/context/user";
import { useSettings } from "@/context/settings";

export default function Cadastro() {

  const navigate = useNavigate();

  const cadastPFisica = () => {
    navigate("/Cadastro");
  };
   const cadastPJuridica = () => {
    navigate("/Cadastro-legal");
  };



  return (
    <main className="flex-1">
      <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-8 lg:px-12">
        <div className="pt-16 md:pt-24 lg:pt-32">
          <div className="max-w-xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
              <h1 className="font-vilane text-2xl md:text-3xl font-normal mb-6">Qual Tipo de conta você deseja criar: </h1>

              <form autoComplete="off" className="space-y-6">
              <Button type="submit" className="w-full bg-agipay-dark-blue text-white rounded-full py-3 text-lg font-vilane" onClick={cadastPFisica}>Pessoa Fisica</Button>
              <Button type="submit" className="w-full bg-agipay-dark-blue text-white rounded-full py-3 text-lg font-vilane" onClick={cadastPJuridica}>Pessoa Juridica</Button>
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
