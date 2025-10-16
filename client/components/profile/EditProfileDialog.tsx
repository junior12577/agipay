import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/context/user";

export function EditProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  useEffect(() => {
    if (open) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [open, user.name, user.email]);

  function onSave() {
    if (!name.trim() || !email.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome e email.", variant: "destructive" });
      return;
    }
    updateUser({ name: name.trim(), email: email.trim() });
    toast({ title: "Dados atualizados", description: "Suas informações foram salvas." });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-agipay-blue text-white border-white/20">
        <DialogHeader>
          <DialogTitle className="font-vilane text-2xl">Editar dados</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/90 text-black placeholder:text-black/50"
              placeholder="Seu nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/90 text-black placeholder:text-black/50"
              placeholder="seu@email.com"
            />
          </div>
          <Button onClick={onSave} className="w-full bg-white text-black font-vilane rounded-full hover:bg-white/90">Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
