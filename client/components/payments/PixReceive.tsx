import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useIndividualUser, useLegalEntityUser } from "@/context/user";
import { QRCodeSVG } from "qrcode.react";

export function PixReceive({ onDone }) {
  const { user: IndividualUser } = useIndividualUser();
  const { user: LegalEntityUser } = useLegalEntityUser();
  const { toast } = useToast();
  const [valor, setValor] = useState("");
  const [payload, setPayload] = useState("");
  const [qrId, setQrId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = IndividualUser ? IndividualUser : LegalEntityUser ? LegalEntityUser : null;
  const currentEmail = currentUser?.email?.trim().toLowerCase() || "";

  async function gerar() {
    const v = Number(valor.replace(",", "."));
    if (!v || v <= 0) {
      toast({
        title: "Informe o valor",
        description: "Para gerar o QR PIX basta informar o valor.",
        variant: "destructive"
      });
      return;
    }
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Nenhum usuário logado.",
        variant: "destructive"
      });
      return;
    }
    if (!currentEmail) {
      toast({
        title: "Erro",
        description: "Usuário sem e-mail cadastrado.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    setPayload("");
    setQrId("");
    setStatus("");
    try {
      const resp = await fetch("https://payment-platform-production-57a2.up.railway.app/transactions/criar-cobranca-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverEmail: currentEmail, amount: v }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Erro ao gerar QR");
      setPayload(data.qrCodeCopyPaste || data.qrCodeBase64 || "");
      setQrId(data.id || "");
      setStatus(data.status || "");
    } catch (e) {
      toast({
        title: "Erro",
        description: e?.message || "Não foi possível gerar o QR.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  function copiarParaClipboard() {
    if (!payload) return;
    navigator.clipboard.writeText(payload)
      .then(() => {
        toast({
          title: "Copiado!",
          description: "Código PIX copiado para a área de transferência.",
        });
      })
      .catch(() => {
        toast({
          title: "Erro",
          description: "Não foi possível copiar o código.",
          variant: "destructive"
        });
      });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="valor" className="text-white">Valor (R$)</Label>
        <Input
          id="valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="bg-white/90 text-black"
          placeholder="0,00"
          disabled={loading}
        />
      </div>
      <Button
        type="button"
        onClick={gerar}
        className="w-full bg-white text-black font-vilane rounded-full"
        disabled={loading}
      >
        {loading ? "Gerando..." : "Gerar QR PIX"}
      </Button>

      {payload && (
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG value={payload} size={220} includeMargin />
          </div>

          <p className="text-white/80 text-sm">Gerado para {currentEmail}</p>

          <div className="w-full text-xs break-all bg-white/10 p-2 rounded">{payload}</div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={copiarParaClipboard}
              className="bg-white text-black font-vilane rounded-full"
            >
              Copiar
            </Button>
            <Button
              type="button"
              onClick={onDone}
              className="bg-white text-black font-vilane rounded-full"
            >
              Fechar
            </Button>
          </div>

          <div className="text-xs text-white/60">Status: {status} | ID: {qrId}</div>
        </div>
      )}
    </div>
  );
}
