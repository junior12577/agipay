import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTransactions } from "@/context/transactions";
import { useIndividualUser, useLegalEntityUser, IndividualUser, LegalEntityUser } from "@/context/user"; 
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt } from "@/components/payments/Receipt";
import { PaymentSuccess } from "@/components/ui/payment-success";
import { QrReader } from "react-qr-reader";

function formatCurrencyBR(v: number | string) {
    const num = typeof v === 'string' ? Number(parseFloat(v.replace(",", "."))) : v;
    return Number(num).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type PixPreview = {
    receiver: string;
    amount: number;
    description?: string;
};

type CurrentUser = IndividualUser | LegalEntityUser | null;

export function PixForm({ onDone }: { onDone: () => void }) {
    const { addTransaction } = useTransactions();
    const individual = useIndividualUser();
    const legalEntity = useLegalEntityUser();

    const currentUser: CurrentUser = individual.user ? individual.user as IndividualUser : legalEntity.user ? legalEntity.user as LegalEntityUser : null;
    const loadingUser = individual.loading || legalEntity.loading;

    const { toast } = useToast();
    const [chave, setChave] = useState("");
    const [descricao, setDescricao] = useState("");
    const [parcelas, setParcelas] = useState(1);
    const [loading, setLoading] = useState(false);
    const [scanOpen, setScanOpen] = useState(false);
    const [camError, setCamError] = useState<string | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receipt, setReceipt] = useState<any>(null);
    const [showAnim, setShowAnim] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [preview, setPreview] = useState<PixPreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    // Preview PIX
    useEffect(() => {
        if (!chave || chave.trim().length < 10) {
            setPreview(null);
            setPreviewError(null);
            return;
        }
        setPreviewLoading(true);
        setPreviewError(null);
        fetch(`https://payment-platform-production-57a2.up.railway.app/transactions/pix/preview?qr=${encodeURIComponent(chave)}`)
            .then(async (res) => {
                if (!res.ok) throw new Error("QR inválido ou não encontrado");
                return res.json();
            })
            .then((data) => setPreview(data))
            .catch((err) => setPreviewError(err.message))
            .finally(() => setPreviewLoading(false));
    }, [chave]);

    // QR Code lido
    async function handleScanned(text: string) {
        if (!text) return;
        setChave(text);         
        setScanOpen(false);     
        setConfirmOpen(true);   
        toast({ title: "QR Code lido!", description: "Chave PIX preenchida automaticamente."});
    }

    // Pagamento via saldo
    async function pagarPix() {
        if (!chave.trim() || !(preview && preview.amount)) { 
            toast({ title: "Dados inválidos", description: "Informe a chave válida e aguarde o preview.", variant: "destructive" });
            return;
        }

        const valorNumerico = preview.amount;
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            toast({ title: "Valor inválido", description: "O valor informado é inválido.", variant: "destructive" });
            return;
        }

        if (!currentUser || !currentUser.email || !currentUser.token) {
            toast({ title: "Erro de autenticação", description: "Usuário não logado.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const body = { senderEmail: currentUser.email, qrCodeCopyPaste: chave };
            const response = await fetch("https://payment-platform-production-57a2.up.railway.app/transactions/pagar-copy-paste", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok) {
                toast({ title: "Erro ao pagar PIX", description: result?.error || "Erro no servidor.", variant: "destructive" });
                setLoading(false);
                return;
            }

            addTransaction({ description: `PIX para ${chave}${preview.description ? ` - ${preview.description}` : ""}`, amount: -valorNumerico, method: "pix" }); 
            toast({ title: "PIX enviado", description: "Transferência realizada com sucesso." });
            
            setReceipt({
                tipo: "PIX",
                id: result.id || Math.random().toString(36).slice(2, 10).toUpperCase(),
                data: new Date().toLocaleString("pt-BR"),
                pagador: {
                    nome: ('fullname' in currentUser ? currentUser.fullname : currentUser.legalName),
                    documento: currentUser.document,
                    email: currentUser.email
                },
                favorecido: { chave, recebedor: preview.receiver }, 
                valor: `R$ ${formatCurrencyBR(valorNumerico)}`,
                descricao: preview.description || undefined,
            });
            
            setShowReceipt(true);
            setShowAnim(true);
        } catch (err: any) {
            toast({ title: "Erro de conexão", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    // Pagamento via cartão
    async function pagarPixCartao(parcelas: number = 1) {
        if (!chave.trim() || !(preview && preview.amount)) { 
            toast({ title: "Dados inválidos", description: "Informe a chave válida e aguarde o preview.", variant: "destructive" });
            return;
        }

        const valorNumerico = preview.amount;
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            toast({ title: "Valor inválido", description: "O valor informado é inválido.", variant: "destructive" });
            return;
        }

        if (!currentUser || !currentUser.email || !currentUser.token) {
            toast({ title: "Erro de autenticação", description: "Usuário não logado.", variant: "destructive" });
            return;
        }

        setLoading(true);

        try {
            const body = { senderEmail: currentUser.email, qrCodeCopyPaste: chave };
            const response = await fetch(`https://payment-platform-production-57a2.up.railway.app/transactions/pagar-pix-cartao?parcelas=${parcelas}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok) {
                toast({ title: "Erro ao pagar com cartão", description: result?.error || "Erro no servidor.", variant: "destructive" });
                setLoading(false);
                return;
            }

            toast({ title: "Pagamento aprovado!", description: "PIX pago com cartão de crédito com sucesso." });

            setReceipt({
                tipo: "PIX via Cartão",
                id: result.id,
                data: new Date().toLocaleString("pt-BR"),
                pagador: {
                    nome: ('fullname' in currentUser ? currentUser.fullname : currentUser.legalName),
                    documento: currentUser.document,
                    email: currentUser.email
                },
                favorecido: { chave, recebedor: preview.receiver },
                valor: `R$ ${formatCurrencyBR(valorNumerico)}`,
                descricao: preview.description || undefined,
            });

            setShowReceipt(true);
            setShowAnim(true);
        } catch (err: any) {
            toast({ title: "Erro de conexão", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!chave.trim() || !preview) {
            toast({ title: "Informe a chave válida", description: "Cole ou leia o QR PIX e aguarde o preview.", variant: "destructive" });
            return;
        }
        setConfirmOpen(true);
    }

    if (loadingUser) return (
        <div className="flex flex-col justify-center items-center h-40">
            <p className="text-white">Carregando dados de autenticação...</p>
        </div>
    );

    if (!currentUser) return (
        <div className="flex flex-col justify-center items-center h-40">
            <p className="text-white text-center">É necessário estar logado para realizar transações PIX.</p>
            <Button onClick={onDone} className="mt-4 bg-white text-black font-vilane rounded-full">Fechar</Button>
        </div>
    );

    return (
        <>
            {showAnim && <PaymentSuccess onEnd={() => setShowAnim(false)} />}
            {showReceipt ? (
                <Receipt data={receipt} onClose={onDone} />
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="chave" className="text-white">Chave/Código PIX</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="chave" 
                                value={chave} 
                                onChange={(e) => setChave(e.target.value)} 
                                className={`bg-white/90 text-black ${chave ? "border-green-400 border-2" : ""}`} 
                                placeholder="Cole o código ou chave PIX" 
                            />
                            <Button type="button" onClick={() => setScanOpen(true)} className="bg-white text-black font-vilane rounded-full">
                                Ler QR
                            </Button>
                        </div>
                    </div>
                    {previewLoading && <p className="text-white/80">Carregando dados...</p>}
                    {previewError && <p className="text-red-400">{previewError}</p>}
                    {preview && (
                        <div className="bg-white/10 p-2 rounded-lg text-white mb-2">
                            <p><b>Valor:</b> R$ {formatCurrencyBR(preview.amount)}</p>
                            {preview.description && <p><b>Descrição:</b> {preview.description}</p>}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="desc" className="text-white">Descrição (opcional)</Label>
                        <Input id="desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="bg-white/90 text-black" placeholder="Motivo do pagamento" />
                    </div>
                    <Button type="submit" className="w-full bg-white text-black font-vilane rounded-full" disabled={loading || !preview}>
                        {loading ? "Enviando..." : "Avançar"}
                    </Button>
                </form>
            )}

            {/* Dialog QR */}
            <Dialog open={scanOpen} onOpenChange={setScanOpen}>
                <DialogContent className="bg-agipay-blue text-white border-white/20 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-vilane text-2xl">Ler QR Code PIX</DialogTitle>
                        <DialogDescription className="text-white/80">
                            Aponte a câmera para o QR Code para preencher a chave.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-xl overflow-hidden bg-black/50">
                        <QrReader
                            constraints={{ facingMode: "environment" }}
                            onResult={(result, error) => {
                                if (!!result) handleScanned(result.getText());
                                if (!!error) setCamError(error.message || "Erro ao acessar câmera");
                            }}
                        />
                    </div>
                    {camError && <p className="text-red-300 text-sm">{camError}</p>}
                    <div className="flex justify-end mt-2">
                        <Button onClick={() => setScanOpen(false)} className="bg-white text-black font-vilane rounded-full">Fechar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Confirmação */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="bg-agipay-blue text-white border-white/20 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-vilane text-2xl">Confirmar pagamento PIX</DialogTitle>
                        <DialogDescription className="text-white/80">Confira os dados antes de pagar.</DialogDescription>
                    </DialogHeader>
                    {preview && (
                        <div className="space-y-2 bg-white/10 p-2 rounded-lg mb-2">
                            <p><b>Valor:</b> R$ {formatCurrencyBR(preview.amount)}</p>
                            {preview.description && <p><b>Descrição:</b> {preview.description}</p>}
                        </div>
                    )}
                    <div className="space-y-3">
                        <div className="text-sm bg-white/10 p-2 rounded-lg max-h-40 overflow-y-auto">
                            <span className="text-white/70 font-semibold">Chave PIX:</span>
                            <p className="break-all text-white mt-1">{chave}</p>
                        </div>
                        <div className="text-sm bg-white/10 p-2 rounded-lg">
                            <span className="text-white/70 font-semibold">Pagador:</span>
                            <p className="text-white mt-1">
                                {currentUser ? ('fullname' in currentUser ? currentUser.fullname : currentUser.legalName) : "-"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                        <Button onClick={() => setConfirmOpen(false)} className="bg-white/20 text-white font-vilane rounded-full">Cancelar</Button>
                        <Button onClick={() => { setConfirmOpen(false); pagarPix(); }} className="bg-white text-black font-vilane rounded-full">Pagar com saldo</Button>
                        <Button onClick={() => { setConfirmOpen(false); pagarPixCartao(parcelas); }} className="bg-white text-black font-vilane rounded-full">Pagar com cartão</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
