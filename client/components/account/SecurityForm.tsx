import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/context/settings";

export function SecurityForm() {
  const { settings, update, changePassword } = useSettings();
  const { toast } = useToast();

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  function onToggle2FA(v: boolean) {
    update({ twoFactor: v });
    toast({ title: v ? "2FA ativado" : "2FA desativado" });
  }

  function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirm) {
      toast({ title: "Senhas diferentes", description: "As senhas devem ser iguais.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = changePassword(oldPwd, newPwd);
      setLoading(false);
      if (!res.ok) {
        toast({ title: "Erro", description: res.reason ?? "Não foi possível alterar a senha.", variant: "destructive" });
        return;
      }
      setOldPwd("");
      setNewPwd("");
      setConfirm("");
      toast({ title: "Senha alterada" });
    }, 500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
        <div>
          <p className="font-vilane text-white">Autenticação em duas etapas</p>
          <p className="text-white/70 text-sm">Recomendado para maior segurança</p>
        </div>
        <Switch checked={settings.twoFactor} onCheckedChange={onToggle2FA} />
      </div>

      <form onSubmit={onChangePassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="old" className="text-white">Senha atual {settings.password ? "" : "(definir)"}</Label>
          <Input id="old" type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} className="bg-white/90 text-black" placeholder={settings.password ? "" : "Deixe em branco se ainda não tem senha"} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new" className="text-white">Nova senha</Label>
            <Input id="new" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="bg-white/90 text-black" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-white">Confirmar senha</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-white/90 text-black" />
          </div>
        </div>
        <Button type="submit" className="bg-white text-black font-vilane rounded-full" disabled={loading}>
          {loading ? "Salvando..." : "Alterar senha"}
        </Button>
      </form>
    </div>
  );
}
