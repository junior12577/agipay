import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";

// CORREÇÃO: ADIÇÃO DE 'recebedor: string;' AO TIPO BOLETO
export type ReceiptData = {
  tipo: "PIX" | "BOLETO";
  id: string;
  data: string; // ISO or formatted
  pagador: { nome: string; documento?: string; email?: string };
  favorecido?: { nome?: string; chave?: string };
  boleto?: { codigo: string; recebedor?: string }; // <-- CORRIGIDO AQUI!
  valor: string; // R$ 0,00
  descricao?: string;
};

export function Receipt({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  async function baixar() {
    if (!ref.current) return;
    const fileName = `comprovante-${data.tipo.toLowerCase()}-${data.id}.png`;
    const url = await toPng(ref.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#0B2B57" });
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  }

  return (
    <div className="space-y-4">
      <div ref={ref} className="bg-agipay-blue text-white p-6 rounded-xl border border-white/20">
        <h3 className="font-vilane text-2xl mb-2">Comprovante {data.tipo}</h3>
        <p className="text-white/70 text-sm">ID: {data.id}</p>
        <p className="text-white/70 text-sm">Data: {data.data}</p>
        <div className="h-px bg-white/20 my-4" />
        <div className="space-y-2">
          <p className="text-white"><span className="text-white/70">Pagador:</span> {data.pagador.nome}{data.pagador.documento ? ` •                        ${data.pagador.documento}` : ""}</p>
          {data.favorecido?.chave && (
                               <div className="break-all overflow-hidden">
                        <span className="font-semibold">Chave PIX: </span>
                        {data.favorecido.chave} 
                    </div>
          )}
          {/* NOVO: EXIBE O RECEBEDOR NO COMPROVANTE */}
          {data.boleto?.recebedor && (
            <p className="text-white"><span className="text-white/70">Recebedor:</span> {data.boleto.recebedor}</p>
          )}
          {data.boleto?.codigo && (
            <p className="text-white break-all"><span className="text-white/70">Boleto:</span> {data.boleto.codigo}</p>
          )}
          {data.descricao && (
            <p className="text-white"><span className="text-white/70">Descrição:</span> {data.descricao}</p>
          )}
          <p className="text-white text-xl mt-2"><span className="text-white/70">Valor:</span> {data.valor}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" onClick={baixar} className="bg-white text-black font-vilane rounded-full">Baixar comprovante</Button>
        <Button type="button" onClick={onClose} className="bg-white/90 text-black font-vilane rounded-full hover:bg-white">Fechar</Button>
      </div>
    </div>
  );
}