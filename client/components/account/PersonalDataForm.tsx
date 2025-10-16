import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  IndividualUser,
  LegalEntityUser,                                                                                                                                                                                                                                                          
  IndividualUserContextValue,
  LegalEntityUserContextValue,
} from "@/context/user";

// -----------------------------------------------------------------
// FUNÇÃO AUXILIAR PARA APLICAR MÁSCARA
// -----------------------------------------------------------------
const applyDocumentMask = (value: string, isIndividual: boolean) => {
  value = value.replace(/\D/g, ""); // remove tudo que não é número

  if (isIndividual) {
    if (value.length > 3) value = value.replace(/(\d{3})(\d)/, "$1.$2");
    if (value.length > 6) value = value.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    if (value.length > 9) value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    return value.substring(0, 14);
  } else {
    if (value.length > 2) value = value.replace(/(\d{2})(\d)/, "$1.$2");
    if (value.length > 6) value = value.replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    if (value.length > 10) value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    if (value.length > 15) value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5");
    return value.substring(0, 18);
  }
};

// -----------------------------------------------------------------
// PROPS DO COMPONENTE
// -----------------------------------------------------------------
type PersonalDataFormProps = {
  user: IndividualUser | LegalEntityUser;
  updateUser:
    | IndividualUserContextValue["updateUser"]
    | LegalEntityUserContextValue["updateUser"];
};

// -----------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------------
export function PersonalDataForm({ user, updateUser }: PersonalDataFormProps) {
  const { toast } = useToast();

  const isIndividual = "fullname" in user;

  // Estados
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");

  // -----------------------------------------------------------------
  // useEffect -> Atualiza os campos quando o usuário for carregado
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const currentName = isIndividual
      ? (user as IndividualUser).fullname
      : (user as LegalEntityUser).legalName;

    setName(currentName || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");

    if (user.document) {
      const masked = applyDocumentMask(user.document, isIndividual);
      setDocument(masked);
    } else {
      setDocument("");
    }
  }, [user, isIndividual]);

  // -----------------------------------------------------------------
  // Handler do campo de documento
  // -----------------------------------------------------------------
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = applyDocumentMask(rawValue, isIndividual);
    setDocument(maskedValue);
  };

  // -----------------------------------------------------------------
  // Função para salvar alterações
  // -----------------------------------------------------------------
  async function save() {
    if (!name.trim() || !email.trim() || !document.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (Nome/Razão Social, Email e CPF/CNPJ).",
        variant: "destructive",
      });
      return;
    }

    // Remove máscara antes de enviar
    const cleanedDocument = document.replace(/\D/g, "");

    const patch: Partial<IndividualUser | LegalEntityUser> = {
      email: email.trim(),
      phone: phone.trim(),
      document: cleanedDocument,
    };

    if (isIndividual) {
      (patch as Partial<IndividualUser>).fullname = name.trim();
    } else {
      (patch as Partial<LegalEntityUser>).legalName = name.trim();
    }

    await updateUser(patch);

    toast({
      title: "Dados atualizados",
      description: "Suas informações foram salvas com sucesso.",
    });
  }

  const nameLabel = isIndividual ? "Nome Completo" : "Razão Social";
  const documentLabel = isIndividual ? "CPF" : "CNPJ";

  // -----------------------------------------------------------------
  // JSX
  // -----------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white">{nameLabel}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white/90 text-black placeholder:text-black/50"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/90 text-black placeholder:text-black/50"
        />
      </div>

      {/* Documento */}
      <div className="space-y-2">
        <Label htmlFor="document" className="text-white">{documentLabel}</Label>
        <Input
          id="document"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={document}
          onChange={handleDocumentChange} // ✅ obrigatório
          className="bg-white/90 text-black placeholder:text-black/50"
        />
      </div>

      <Button
        onClick={save}
        className="bg-white text-black font-vilane rounded-full hover:bg-white/90"
      >
        Salvar
      </Button>
    </div>
  );
}
