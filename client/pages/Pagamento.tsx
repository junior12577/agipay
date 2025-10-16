import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PixForm } from "@/components/payments/PixForm";
import { BoletoForm } from "@/components/payments/BoletoForm";
import { PixReceive } from "@/components/payments/PixReceive";
import { GerarBoletoForm } from "@/components/payments/GerarBoleto"; // Importe o componente correto
import { useState } from "react";
import { CartaoForm } from "@/components/payments/CartaoForm";

export default function Pagamento() {
  const paymentMethods = [
    { key: "pix" as const, name: "Pix", description: "Transferência instantânea" },
    { key: "boleto" as const, name: "Boleto", description: "Pagamento de boletos" },
    { key: "pix_qr" as const, name: "Receber PIX", description: "Gerar QR para receber" },
    { key: "gerar_boleto" as const, name: "Gerar Boleto", description: "Crie um boleto para receber pagamentos" },
    { key: "gerar_cartao" as const, name: "Gerar Cartao", description: "Crie um Cartão de Crédito para pagar" },
    
     // Novo método
  ];

  const [open, setOpen] = useState<null | "pix" | "boleto" | "pix_qr" | "gerar_boleto" | "gerar_cartao">(null);

  return (
    <main className="flex-1">
      <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-8 lg:px-12">
        {/* Payment Methods Grid */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {paymentMethods.map((method) => (
                <div key={method.name} className="flex flex-col">
                  <Button
                    variant="secondary"
                    onClick={() => setOpen(method.key)}
                    className="bg-white text-black font-vilane text-xl md:text-2xl lg:text-3xl px-8 py-6 md:px-12 md:py-8 lg:px-16 lg:py-10 rounded-full hover:bg-white/90 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    {method.name}
                  </Button>
                  <p className="text-white/80 text-center mt-3 font-vilane text-sm md:text-base">
                    {method.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 md:mt-24 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 text-white">
            <h3 className="font-vilane text-xl md:text-2xl mb-6 text-center">Como funciona?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-vilane text-lg mb-2">PIX</h4>
                <p className="text-sm text-white/80">
                  Transferências instantâneas 24 horas por dia, 7 dias por semana. Rápido, seguro e gratuito. Você pode
                  ler um QR para pagar ou gerar um QR para receber.
                </p>
              </div>
              <div>
                <h4 className="font-vilane text-lg mb-2">Boleto</h4>
                <p className="text-sm text-white/80">
                  Pague seus boletos de forma rápida e segura. Escaneie o código de barras ou digite os números.
                </p>
              </div>
              <div>
                <h4 className="font-vilane text-lg mb-2">Gerar Boleto</h4>
                <p className="text-sm text-white/80">
                  Gere um boleto para receber pagamentos de clientes ou amigos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="bg-agipay-blue text-white border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-vilane text-2xl">
              {open === "pix" && "Enviar PIX"}
              {open === "boleto" && "Pagar boleto"}
              {open === "pix_qr" && "Receber PIX"}
              {open === "gerar_boleto" && "Gerar Boleto"}
              {open === "gerar_cartao" && "Gerar cartao"}
            </DialogTitle>
          </DialogHeader>
          {open === "pix" && <PixForm onDone={() => setOpen(null)} />}
          {open === "boleto" && <BoletoForm onDone={() => setOpen(null)} />}
          {open === "pix_qr" && <PixReceive onDone={() => setOpen(null)} />}
          {open === "gerar_boleto" && <GerarBoletoForm onDone={() => setOpen(null)} />}
          {open === "gerar_cartao" && <CartaoForm onDone={() => setOpen(null)} />}
        </DialogContent>
      </Dialog>
    </main>
  );
}
