import { useState } from "react";
import type { FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useIndividualUser, useLegalEntityUser } from "@/context/user";

export function GerarBoletoForm({ onDone }: { onDone: () => void }) {
  const { toast } = useToast();
  const { user: IndividualUser } = useIndividualUser();
  const { user: LegalEntityUser } = useLegalEntityUser();
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [emailSender, setEmailSender] = useState(""); // Novo estado para o email do pagador
  const [loading, setLoading] = useState(false);

  // Considera usuário logado se email estiver presente
  const isIndividual = IndividualUser && IndividualUser.email;
  const isLegal = LegalEntityUser && LegalEntityUser.email;
  const currentUser = isIndividual ? IndividualUser : isLegal ? LegalEntityUser : null;

  function getVencimento() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    // Garante que o valor está no formato correto (ponto decimal)
    const v = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    if (!emailSender.trim()) {
      toast({ title: "E-mail do pagador ausente", description: "Informe o e-mail de quem vai pagar o boleto.", variant: "destructive" });
      return;
    }
    if (isNaN(v) || v <= 0) {
      toast({ title: "Valor inválido", description: "Informe um valor maior que 0.", variant: "destructive" });
      return;
    }
    if (!currentUser?.email) {
      toast({ title: "Erro", description: "Usuário sem email cadastrado.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const body = {
        emailSender: emailSender,
        emailReceiver: currentUser.email,
        amount: v,
        vencimento: getVencimento()
      };

      const response = await fetch("https://payment-platform-production-57a2.up.railway.app/transactions/generateBoleto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser.token ? { Authorization: `Bearer ${currentUser.token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorText = "";
        try { errorText = await response.text(); } catch {}
        toast({ title: "Erro ao gerar boleto", description: errorText || "Tente novamente.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
      toast({ title: "Boleto gerado", description: "O PDF foi aberto em uma nova aba." });
      // onDone(); // Se quiser fechar o modal após gerar
    } catch (err: any) {
      toast({ title: "Erro de conexão", description: err?.message || "Não foi possível conectar ao servidor.", variant: "destructive" });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="valor" className="text-white">Valor (R$)</Label>
        <Input
          id="valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="bg-white/90 text-black"
          placeholder="0,00"
          inputMode="decimal"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emailSender" className="text-white">E-mail do Pagador</Label>
        <Input
          id="emailSender"
          type="email"
          value={emailSender}
          onChange={(e) => setEmailSender(e.target.value)}
          className="bg-white/90 text-black"
          placeholder="email@pagador.com"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="descricao" className="text-white">Descrição (opcional)</Label>
        <Input
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="bg-white/90 text-black"
          placeholder="Serviço, produto, etc."
          disabled={loading}
        />
      </div>
      <Button type="submit" className="w-full bg-white text-black font-vilane rounded-full" disabled={loading}>
        {loading ? "Gerando..." : "Gerar boleto"}
      </Button>
    </form>
  );
}
