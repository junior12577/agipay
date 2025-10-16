import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/context/settings";

export function NotificationsForm() {
  const { settings, updateNotifications } = useSettings();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
        <div>
          <p className="font-vilane text-white">Email</p>
          <p className="text-white/70 text-sm">Receber alertas e extratos por email</p>
        </div>
        <Switch checked={settings.notifications.email} onCheckedChange={(v) => updateNotifications({ email: v })} />
      </div>
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
        <div>
          <p className="font-vilane text-white">SMS</p>
          <p className="text-white/70 text-sm">Receber notificações por SMS</p>
        </div>
        <Switch checked={settings.notifications.sms} onCheckedChange={(v) => updateNotifications({ sms: v })} />
      </div>
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
        <div>
          <p className="font-vilane text-white">Push</p>
          <p className="text-white/70 text-sm">Receber notificações no app</p>
        </div>
        <Switch checked={settings.notifications.push} onCheckedChange={(v) => updateNotifications({ push: v })} />
      </div>
    </div>
  );
}
