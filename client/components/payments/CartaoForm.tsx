import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTransactions } from "@/context/transactions";
import { useIndividualUser, useLegalEntityUser } from "@/context/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";

type CreatedCardDTO = {
  creditNumber: string;
  cvv: string;
  expiration: string;
  creditLimit: string;
};

export function CartaoForm({ onDone }: { onDone: () => void }) {
  const { addTransaction } = useTransactions();
  const { user: individualUser } = useIndividualUser();
  const { user: legalEntityUser } = useLegalEntityUser();
  const currentUser = individualUser || legalEntityUser;

  const { toast } = useToast();

  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const [createdCard, setCreatedCard] = useState<CreatedCardDTO | null>(null);
  const [openCardDialog, setOpenCardDialog] = useState(false);

  // Carrega cartão salvo no localStorage ao montar o componente
  useEffect(() => {
    const savedCard = localStorage.getItem("createdCard");
    if (savedCard) {
      setCreatedCard(JSON.parse(savedCard));
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUser?.email || !currentUser?.token) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://payment-platform-production-57a2.up.railway.app/transactions/create-credit-card",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ email: currentUser.email }),
        }
      );

      if (!response.ok) {
        let errMsg = "Verifique os dados e tente novamente.";
        try {
          const errJson = await response.json();
          if (errJson?.message) errMsg = errJson.message;
        } catch {}
        toast({
          title: "Erro ao criar cartão",
          description: errMsg,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const data: CreatedCardDTO = await response.json();
      setCreatedCard(data);
      localStorage.setItem("createdCard", JSON.stringify(data));
      setOpenCardDialog(true);

      const v = Number(String(valor).replace(",", "."));
      if (v && v > 0) {
        addTransaction({
          description: `Cartão gerado - **** ${String(data.creditNumber).slice(-4)}${
            descricao ? ` - ${descricao}` : ""
          }`,
          amount: -v,
          method: "cartao",
        });
      }

      toast({
        title: "Cartão criado com sucesso",
        description: "Confira as informações no cartão.",
      });
    } catch (err) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyNumber() {
    if (!createdCard) return;
    try {
      await navigator.clipboard.writeText(createdCard.creditNumber);
      toast({
        title: "Número copiado",
        description: "Número do cartão copiado para a área de transferência.",
      });
    } catch {
      toast({
        title: "Falha ao copiar",
        description: "Não foi possível copiar o número.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <form onSubmit={submit} className="space-y-4">
        <Button
          type="submit"
          className="w-full bg-white text-black font-vilane rounded-full"
          disabled={loading}
        >
          {loading ? "Processando..." : "Gerar Cartão"}
        </Button>

        {/* Botão para ver cartão gerado */}
        {createdCard && (
          <Button
            type="button"
            className="w-full bg-blue-600 text-white font-vilane rounded-full mt-2 animate-pulse"
            onClick={() => setOpenCardDialog(true)}
          >
            Ver Cartão Gerado
          </Button>
        )}
      </form>

      <Dialog
        open={openCardDialog}
        onOpenChange={(v) => {
          setOpenCardDialog(v);
          if (!v) onDone();
        }}
      >
        <DialogContent className="bg-white/10 backdrop-blur-sm text-white border border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle>Cartão Criado</DialogTitle>
            <DialogDescription>
              Confira os dados do cartão abaixo. Guarde essas informações em local seguro.
            </DialogDescription>
          </DialogHeader>

          {createdCard ? (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Número do cartão</p>
                  <p className="font-mono text-lg tracking-widest">{createdCard.creditNumber}</p>
                </div>
                <button
                  onClick={handleCopyNumber}
                  title="Copiar número"
                  className="p-2 rounded-md hover:bg-white/10 transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/80">Validade</p>
                  <p>{createdCard.expiration}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80">CVV</p>
                  <p>{createdCard.cvv}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-white/80">Limite</p>
                <p>
                  R$ {Number(createdCard.creditLimit).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ) : (
            <p>Carregando informações...</p>
          )}

          <DialogFooter>
            <Button onClick={() => setOpenCardDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
