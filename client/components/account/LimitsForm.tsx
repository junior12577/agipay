import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/settings";
import { useToast } from "@/components/ui/use-toast";

function toNumber(v: string) {
  if (!v) return 0;
  return Number(v.replace(/\./g, "").replace(",", "."));
}

export function LimitsForm() {
  const { settings, updateLimits } = useSettings();
  const { toast } = useToast();
  const [pix, setPix] = useState(settings.limits.pixDaily.toString());
  const [transf, setTransf] = useState(settings.limits.transferDaily.toString());
  const [card, setCard] = useState(settings.limits.cardSingle.toString());

  useEffect(() => {
    setPix(String(settings.limits.pixDaily));
    setTransf(String(settings.limits.transferDaily));
    setCard(String(settings.limits.cardSingle));
  }, [settings.limits.pixDaily, settings.limits.transferDaily, settings.limits.cardSingle]);

  function save() {
    const p = toNumber(pix);
    const t = toNumber(transf);
    const c = toNumber(card);
    updateLimits({ pixDaily: p, transferDaily: t, cardSingle: c });
    toast({ title: "Limites atualizados" });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pix" className="text-white">Limite diário PIX (R$)</Label>
        <Input id="pix" value={pix} onChange={(e) => setPix(e.target.value)} className="bg-white/90 text-black" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="transf" className="text-white">Limite diário Transferência (R$)</Label>
        <Input id="transf" value={transf} onChange={(e) => setTransf(e.target.value)} className="bg-white/90 text-black" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="card" className="text-white">Limite único Cartão (R$)</Label>
        <Input id="card" value={card} onChange={(e) => setCard(e.target.value)} className="bg-white/90 text-black" />
      </div>
      <Button onClick={save} className="bg-white text-black font-vilane rounded-full hover:bg-white/90">Salvar limites</Button>
    </div>
  );
}
