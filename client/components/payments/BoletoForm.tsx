import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTransactions } from "@/context/transactions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt, type ReceiptData } from "@/components/payments/Receipt";
import { useIndividualUser, useLegalEntityUser } from "@/context/user";
import { PaymentSuccess } from "@/components/ui/payment-success";

function formatCurrencyBR(v: number | string) {
  // Garante que a entrada seja tratada como número antes de formatar
  const num = typeof v === 'string' ? Number(parseFloat(v.replace(",", "."))) : v;
  return Number(num).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function BoletoForm({ onDone }: { onDone: () => void }) {
  const { addTransaction } = useTransactions();
  const { toast } = useToast();
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const { user: IndividualUser } = useIndividualUser();
  const { user: LegalEntityUser } = useLegalEntityUser();
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showAnim, setShowAnim] = useState(false);
  
  const [valorBoleto, setValorBoleto] = useState("");
  const [recebedor, setRecebedor] = useState("");

  function handleValorChange(v: string) {
    // Permite apenas números, vírgula ou ponto (converte ponto para vírgula para pt-BR)
    let formatted = v.replace(/[^\d.,]/g, ''); 
    
    // Garante que só haja uma vírgula
    const parts = formatted.split(',');
    if (parts.length > 2) {
        formatted = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Se usar ponto, converte para vírgula (formato brasileiro)
    formatted = formatted.replace('.', ',');

    setValorBoleto(formatted);
  }

  function handleScanned(result: any) {
    if (result?.text) {
      // Remove espaços e caracteres não-numéricos para obter apenas a linha digitável
      const clean = result.text.replace(/\s+/g, "").replace(/[^0-9]/g, "");
      if (!clean) {
        toast({ title: "Não reconhecido", description: "Aponte para o código de barras do boleto.", variant: "destructive" });
        return;
      }
      setCodigo(clean);
      toast({ title: "Código lido", description: "Linha preenchida. Por favor, insira o valor e o recebedor." });
      setScanOpen(false);
    }
  }

  const currentUser = IndividualUser ? IndividualUser : LegalEntityUser ? LegalEntityUser : null;

  let nomePagador = "";
  // Verifica o tipo de usuário e pega o nome correto (fullname ou legalName)
  if (currentUser && "fullname" in currentUser) {
    nomePagador = currentUser.fullname || "";
  } else if (currentUser && "legalName" in currentUser) {
    nomePagador = currentUser.legalName || "";
  }
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!codigo.trim() || codigo.trim().length < 40) {
      toast({ title: "Código inválido", description: "Informe o código de barras completo (mínimo 40 dígitos).", variant: "destructive" });
      return;
    }

    const valorNumerico = parseFloat(valorBoleto.replace(",", "."));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast({ title: "Valor inválido", description: "Informe um valor válido para o boleto.", variant: "destructive" });
      return;
    }

    if (!currentUser || !currentUser.token) {
      toast({ title: "Erro de autenticação", description: "Usuário não logado. Tente relogar.", variant: "destructive" });
      return;
    }
    
    const recebedorDescricao = recebedor.trim() || 'Beneficiário Desconhecido';

    setLoading(true);

    try {
      // Endpoint de pagamento mantido com a correção: /transactions/pagarBoleto (camel case)
      const response = await fetch("https://payment-platform-production-57a2.up.railway.app/transactions/pagarBoleto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          codeBoleto: codigo,
        }),
      });
      
      let result;
      try {
          result = await response.json();
      } catch {
          result = {};
      }

      if (!response.ok) {
        toast({ 
          title: "Erro ao pagar boleto", 
          description: result?.error || "Verifique o código e tente novamente.", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      toast({ title: "Boleto pago", description: "Pagamento efetuado com sucesso." });
      addTransaction({
        description: `Pagamento de Boleto ${recebedor ? `para ${recebedor}` : ''}`,
        amount: -valorNumerico,
        method: "boleto"
      });
      
      const id = result.id || Math.random().toString(36).slice(2, 10).toUpperCase();
      const data = new Date().toLocaleString("pt-BR");
      
      setReceipt({
        tipo: "BOLETO",
        id,
        data,
        pagador: {
          nome: nomePagador,
          documento: currentUser?.document,
          email: currentUser?.email
        },
        // Dados de boleto preenchidos com os valores digitados/lidos
        boleto: { codigo, recebedor: recebedorDescricao }, 
        valor: `R$ ${formatCurrencyBR(valorNumerico)}`,
        descricao: descricao || undefined,
      });
      setShowReceipt(true);
      setShowAnim(true);
    } catch (err: any) {
      toast({ title: "Erro de conexão", description: err.message || "Não foi possível conectar ao servidor.", variant: "destructive" });
    }
    setLoading(false);
  }

  return (
    <>
      {showAnim && <PaymentSuccess onEnd={() => setShowAnim(false)} />}
      {showReceipt ? (
        <Receipt data={receipt!} onClose={onDone} />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          
          {/* 1. Campo de Código de Barras e Botão de Leitura */}
          <div className="space-y-2">
            <Label htmlFor="codigo" className="text-white">Código de barras</Label>
            <div className="flex gap-2">
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="bg-white/90 text-black"
                placeholder="Linha digitável"
              disabled={loading}
              />
            </div>
          </div>

          {/* 2. Agrupamento de Valor e Recebedor (Similar ao design da imagem) */}
          <div className="bg-white/10 p-4 rounded-xl space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="valor" className="text-white">Valor (R$)</Label>
                  <Input
                    id="valor"
                    value={valorBoleto}
                    onChange={(e) => handleValorChange(e.target.value)}
                    className="bg-white/90 text-black"
                    placeholder="0,00"
                    inputMode="decimal"
                    required
                    disabled={loading}
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="recebedor" className="text-white">Recebedor</Label>
                  <Input 
                    id="recebedor" 
                    value={recebedor} 
                    onChange={(e) => setRecebedor(e.target.value)} 
                    className="bg-white/90 text-black" 
                    placeholder="Nome do Beneficiário"
                    required
                    disabled={loading}
                  />
              </div>
          </div>
          
          {/* 3. Campo de Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-white">Descrição (opcional)</Label>
            <Input 
              id="descricao" 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              className="bg-white/90 text-black" 
              placeholder="Conta de luz, internet..."
              disabled={loading} 
            />
          </div>
          
          {/* 4. Botão de Envio */}
          <Button 
            type="submit" 
            className="w-full bg-white text-black font-vilane rounded-full" 
            // Garante que todos os campos obrigatórios estejam preenchidos
            disabled={loading || !valorBoleto || !codigo || !recebedor}
          >
            {loading ? "Pagando..." : "Pagar boleto"}
          </Button>
        </form>
      )}
    </>
  );
}