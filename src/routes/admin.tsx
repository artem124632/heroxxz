import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  fetchSettings, fetchServices, getAdminPwd, setAdminPwd, clearAdminPwd,
  DEFAULT_SETTINGS, type SiteSettings, type Service, type Ticket,
} from "@/lib/store";
import {
  verifyAdmin, upsertService, deleteService as deleteServiceFn,
  updateSettings, listTickets, deleteTicket as deleteTicketFn,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Heroxxz" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [pwd, setPwd] = useState("");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState("");
  const verify = useServerFn(verifyAdmin);

  useEffect(() => {
    const stored = getAdminPwd();
    if (!stored) { setChecking(false); return; }
    verify({ data: { password: stored } })
      .then((r) => { if (r.ok) { setPwd(stored); setAuthed(true); } else clearAdminPwd(); })
      .catch(() => clearAdminPwd())
      .finally(() => setChecking(false));
  }, []);

  if (checking) return null;

  if (!authed) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const r = await verify({ data: { password: pwd } });
              if (r.ok) { setAdminPwd(pwd); setAuthed(true); }
              else setErr("Неверный пароль");
            } catch { setErr("Ошибка проверки"); }
          }}
          className="relative z-10 glass-card p-8 w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold mb-1">Админ-панель</h1>
          <p className="text-sm text-muted-foreground mb-6">Введи пароль для входа</p>
          <input
            type="password"
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setErr(""); }}
            placeholder="Пароль"
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
          <button className="mt-5 w-full py-3 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold">
            Войти
          </button>
          <a href="/" className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground">← На сайт</a>
        </form>
      </div>
    );
  }

  return <Dashboard password={pwd} onLogout={() => { clearAdminPwd(); setAuthed(false); setPwd(""); }} />;
}

function Dashboard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"tickets" | "services" | "settings">("tickets");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [services, setServices] = useState<Service[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const list = useServerFn(listTickets);
  const upsert = useServerFn(upsertService);
  const delSvc = useServerFn(deleteServiceFn);
  const upSettings = useServerFn(updateSettings);
  const delTicket = useServerFn(deleteTicketFn);

  const reload = async () => {
    const [st, sv, tk] = await Promise.all([
      fetchSettings(),
      fetchServices(),
      list({ data: { password } }),
    ]);
    setSettings(st);
    setServices(sv);
    setTickets(tk as Ticket[]);
  };

  useEffect(() => { reload().catch(console.error); }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await upSettings({ data: { password, settings } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Ошибка: " + (e as Error).message);
    } finally { setSaving(false); }
  };

  const saveService = async (sv: Service, isNew: boolean) => {
    setSaving(true);
    try {
      await upsert({
        data: {
          password,
          service: {
            id: isNew ? undefined : sv.id,
            title: sv.title,
            description: sv.description,
            price: sv.price,
            old_price: sv.old_price,
            features: sv.features,
            highlighted: sv.highlighted,
            sort_order: sv.sort_order,
          },
        },
      });
      await reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Ошибка: " + (e as Error).message);
    } finally { setSaving(false); }
  };

  const removeService = async (id: string) => {
    if (!confirm("Удалить услугу?")) return;
    await delSvc({ data: { password, id } });
    await reload();
  };

  const removeTicket = async (id: string) => {
    await delTicket({ data: { password, id } });
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const addService = () => {
    setServices((prev) => [...prev, {
      id: `new-${Date.now()}`,
      title: "Новая услуга",
      description: "",
      price: 0,
      old_price: null,
      features: [],
      highlighted: false,
      sort_order: prev.length + 1,
    }]);
  };

  return (
    <div className="relative min-h-screen">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/40 sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">◆</span>
            Heroxxz <span className="text-muted-foreground font-normal">/ admin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {saved && <span className="text-secondary">✓ Сохранено</span>}
            <a href="/" className="text-muted-foreground hover:text-foreground">На сайт</a>
            <button onClick={onLogout} className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted">Выйти</button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {([
            ["tickets", `Заявки (${tickets.length})`],
            ["services", "Услуги"],
            ["settings", "Настройки сайта"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                tab === k ? "bg-[image:var(--gradient-primary)] text-primary-foreground" : "glass-card hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "tickets" && (
          <div className="space-y-3">
            {tickets.length === 0 && (
              <div className="glass-card p-10 text-center text-muted-foreground">Заявок пока нет</div>
            )}
            {tickets.map((t) => {
              const svc = services.find((x) => x.id === t.service_id);
              return (
                <div key={t.id} className="glass-card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-semibold">
                        {t.contact_type === "telegram" ? "Telegram" : "Discord"}: <span className="gradient-text">{t.contact}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(t.created_at).toLocaleString("ru-RU")}</div>
                    </div>
                    <button onClick={() => removeTicket(t.id)} className="text-sm text-destructive hover:underline">
                      Удалить
                    </button>
                  </div>
                  <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Услуга:</span> {svc?.title || "—"}</div>
                    <div><span className="text-muted-foreground">Бюджет:</span> {t.budget || "—"}</div>
                  </div>
                  <p className="mt-3 text-sm whitespace-pre-wrap">{t.message}</p>
                </div>
              );
            })}
          </div>
        )}

        {tab === "services" && (
          <div className="space-y-4">
            {services.map((sv) => (
              <ServiceEditor
                key={sv.id}
                service={sv}
                saving={saving}
                onSave={(next, isNew) => saveService(next, isNew)}
                onDelete={() => removeService(sv.id)}
                isNew={sv.id.startsWith("new-")}
              />
            ))}
            <button
              onClick={addService}
              className="w-full py-3 rounded-xl border border-dashed border-border hover:bg-white/5"
            >
              + Добавить услугу
            </button>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-5">
            <Section title="Основное">
              <Input label="Название сайта" value={settings.siteName} onChange={(v) => setSettings((p) => ({ ...p, siteName: v }))} />
              <Input label="Слоган" value={settings.tagline} onChange={(v) => setSettings((p) => ({ ...p, tagline: v }))} />
            </Section>
            <Section title="Hero">
              <Input label="Бейдж" value={settings.heroBadge} onChange={(v) => setSettings((p) => ({ ...p, heroBadge: v }))} />
              <Input label="Заголовок (строка 1)" value={settings.heroTitle1} onChange={(v) => setSettings((p) => ({ ...p, heroTitle1: v }))} />
              <Input label="Заголовок (строка 2, градиент)" value={settings.heroTitle2} onChange={(v) => setSettings((p) => ({ ...p, heroTitle2: v }))} />
              <Textarea label="Подзаголовок" value={settings.heroLead} onChange={(v) => setSettings((p) => ({ ...p, heroLead: v }))} />
            </Section>
            <Section title="Статистика">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label="Значение 1" value={settings.stat1V} onChange={(v) => setSettings((p) => ({ ...p, stat1V: v }))} />
                <Input label="Подпись 1" value={settings.stat1L} onChange={(v) => setSettings((p) => ({ ...p, stat1L: v }))} />
                <Input label="Значение 2" value={settings.stat2V} onChange={(v) => setSettings((p) => ({ ...p, stat2V: v }))} />
                <Input label="Подпись 2" value={settings.stat2L} onChange={(v) => setSettings((p) => ({ ...p, stat2L: v }))} />
                <Input label="Значение 3" value={settings.stat3V} onChange={(v) => setSettings((p) => ({ ...p, stat3V: v }))} />
                <Input label="Подпись 3" value={settings.stat3L} onChange={(v) => setSettings((p) => ({ ...p, stat3L: v }))} />
              </div>
            </Section>
            <Section title="Контакты и футер">
              <Input label="Telegram" value={settings.contactTg} onChange={(v) => setSettings((p) => ({ ...p, contactTg: v }))} />
              <Input label="Discord" value={settings.contactDc} onChange={(v) => setSettings((p) => ({ ...p, contactDc: v }))} />
              <Input label="Текст футера" value={settings.footerText} onChange={(v) => setSettings((p) => ({ ...p, footerText: v }))} />
            </Section>
            <div className="sticky bottom-4 glass-card p-4 flex items-center justify-end gap-3">
              <button onClick={saveSettings} disabled={saving} className="px-5 py-2.5 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold disabled:opacity-60">
                {saving ? "Сохраняю..." : "Сохранить изменения"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{adminCss}</style>
    </div>
  );
}

function ServiceEditor({ service, saving, onSave, onDelete, isNew }: {
  service: Service; saving: boolean; onSave: (s: Service, isNew: boolean) => void; onDelete: () => void; isNew: boolean;
}) {
  const [draft, setDraft] = useState(service);
  useEffect(() => { setDraft(service); }, [service.id]);
  const set = (patch: Partial<Service>) => setDraft({ ...draft, ...patch });

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Input label="Название" value={draft.title} onChange={(v) => set({ title: v })} />
        <label className="flex items-center gap-2 text-sm whitespace-nowrap mt-6">
          <input type="checkbox" checked={draft.highlighted} onChange={(e) => set({ highlighted: e.target.checked })} />
          Популярная
        </label>
      </div>
      <Textarea label="Описание" value={draft.description} onChange={(v) => set({ description: v })} />
      <div className="grid sm:grid-cols-3 gap-3">
        <Input label="Цена (₽)" type="number" value={String(draft.price)} onChange={(v) => set({ price: Number(v) || 0 })} />
        <Input label="Старая цена (опц.)" type="number" value={draft.old_price?.toString() || ""} onChange={(v) => set({ old_price: v ? Number(v) : null })} />
        <Input label="Порядок" type="number" value={String(draft.sort_order)} onChange={(v) => set({ sort_order: Number(v) || 0 })} />
      </div>
      <Textarea label="Особенности (по одной на строку)" value={draft.features.join("\n")} onChange={(v) => set({ features: v.split("\n").map((x) => x.trim()).filter(Boolean) })} />
      <div className="flex items-center justify-between gap-3">
        <button onClick={onDelete} className="text-sm text-destructive hover:underline">Удалить</button>
        <button onClick={() => onSave(draft, isNew)} disabled={saving} className="px-4 py-2 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold text-sm disabled:opacity-60">
          {isNew ? "Создать" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 space-y-3">
      <h3 className="text-lg font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block w-full">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="admin-input" />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="admin-input resize-none" />
    </label>
  );
}

const adminCss = `
.admin-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  background: oklch(1 0 0 / 0.04);
  border: 1px solid oklch(1 0 0 / 0.1);
  border-radius: 0.65rem;
  color: var(--foreground);
  outline: none;
  font: inherit;
  transition: all 0.15s;
}
.admin-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px oklch(0.68 0.22 295 / 0.2); }
`;
