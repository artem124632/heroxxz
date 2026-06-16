import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSettings, fetchServices, submitTicket, type Service, type SiteSettings } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Heroxxz — Веб-разработка под ключ" },
      { name: "description", content: "Лендинги, сайты и доработка. Быстро, стильно, с гарантией." },
      { property: "og:title", content: "Heroxxz — Веб-разработка под ключ" },
      { property: "og:description", content: "Лендинги, сайты и доработка. Быстро, стильно, с гарантией." },
    ],
  }),
  component: Index,
});

function Index() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [sent, setSent] = useState(false);
  const [serviceId, setServiceId] = useState("");

  useEffect(() => {
    fetchSettings().then(setS).catch(() => setS({} as SiteSettings));
    fetchServices().then(setServices).catch(() => setServices([]));
  }, []);

  if (!s) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Загрузка...</div>;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const svc = String(fd.get("service_id") || "");
    try {
      await submitTicket({
        contact_type: fd.get("contact_type") as "telegram" | "discord",
        contact: String(fd.get("contact") || ""),
        service_id: svc && svc !== "other" ? svc : null,
        budget: String(fd.get("budget") || ""),
        message: String(fd.get("message") || ""),
      });
      setSent(true);
      form.reset();
      setServiceId("");
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      alert("Ошибка отправки: " + (err as Error).message);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-grid-pattern" />

      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/40 sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">◆</span>
            {s.siteName}
          </a>
          <nav className="flex items-center gap-2 sm:gap-6 text-sm">
            <a href="#services" className="text-muted-foreground hover:text-foreground transition hidden sm:inline">Услуги</a>
            <a href="#why" className="text-muted-foreground hover:text-foreground transition hidden sm:inline">Почему я</a>
            <a href="#order" className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition">Заказать</a>
          </nav>
        </div>
      </header>

      <section className="relative z-10 pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-muted-foreground mb-8">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            {s.heroBadge}
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05]">
            {s.heroTitle1}<br />
            <span className="gradient-text">{s.heroTitle2}</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{s.heroLead}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="#order" className="px-6 py-3 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--glow-primary)] hover:scale-[1.03] transition">
              Создать заявку →
            </a>
            <a href="#services" className="px-6 py-3 rounded-xl border border-border hover:bg-muted transition font-medium">
              Посмотреть услуги
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[[s.stat1V, s.stat1L], [s.stat2V, s.stat2L], [s.stat3V, s.stat3L]].map(([v, l], i) => (
              <div key={i} className="glass-card p-5">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{v}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold">Услуги и цены</h2>
            <p className="text-muted-foreground mt-3">Выбери подходящий вариант или опиши свой в заявке</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((sv) => (
              <div key={sv.id} className={`relative glass-card p-8 transition hover:-translate-y-1 ${sv.highlighted ? "ring-2 ring-primary shadow-[var(--glow-primary)]" : ""}`}>
                {sv.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-[image:var(--gradient-primary)] text-primary-foreground">
                    Популярное
                  </div>
                )}
                <h3 className="text-xl font-bold">{sv.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">{sv.description}</p>
                <div className="mt-5 flex items-baseline gap-3">
                  {sv.old_price ? <span className="text-muted-foreground line-through">{sv.old_price.toLocaleString("ru-RU")} ₽</span> : null}
                  <span className="text-3xl font-extrabold gradient-text">{sv.price.toLocaleString("ru-RU")} ₽</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm">
                  {sv.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-secondary">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setServiceId(sv.id); document.getElementById("order")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="mt-8 w-full py-3 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold hover:scale-[1.02] transition"
                >
                  Заказать
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12">Почему ко мне</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: "⚡", t: "Быстро", d: "Лендинг — за 3–5 дней" },
              { icon: "🎨", t: "Дизайн", d: "Современно и стильно" },
              { icon: "🛠️", t: "Чистый код", d: "Поддержка без боли" },
              { icon: "💬", t: "На связи", d: "Telegram / Discord 24/7" },
            ].map((x, i) => (
              <div key={i} className="glass-card p-6 hover:-translate-y-1 transition">
                <div className="text-3xl">{x.icon}</div>
                <h4 className="mt-3 font-bold">{x.t}</h4>
                <p className="text-sm text-muted-foreground mt-1">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="order" className="relative z-10 py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold">Оставить заявку</h2>
            <p className="text-muted-foreground mt-3">Опиши задачу — я отвечу в Telegram или Discord</p>
          </div>

          {sent && (
            <div className="mb-6 p-4 rounded-xl bg-secondary/15 border border-secondary/40 text-secondary">
              ✓ Заявка отправлена! Я свяжусь с тобой в ближайшее время.
            </div>
          )}

          <form onSubmit={onSubmit} className="glass-card p-6 sm:p-8 space-y-5">
            <div className="grid sm:grid-cols-[160px_1fr] gap-4">
              <Field label="Где писать">
                <select name="contact_type" required className="input">
                  <option value="telegram">Telegram</option>
                  <option value="discord">Discord</option>
                </select>
              </Field>
              <Field label="Контакт">
                <input name="contact" required maxLength={80} placeholder="@username или name#1234" className="input" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-[1fr_180px] gap-4">
              <Field label="Услуга">
                <select name="service_id" value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="input">
                  <option value="">— выбери —</option>
                  {services.map((sv) => (
                    <option key={sv.id} value={sv.id}>{sv.title} — {sv.price.toLocaleString("ru-RU")} ₽</option>
                  ))}
                  <option value="other">Другое / обсудим</option>
                </select>
              </Field>
              <Field label="Бюджет (необязательно)">
                <input name="budget" maxLength={40} placeholder="например 30 000 ₽" className="input" />
              </Field>
            </div>
            <Field label="Опиши задачу">
              <textarea name="message" required minLength={10} maxLength={2000} rows={5} placeholder="Что нужно сделать, для кого, есть ли референсы..." className="input resize-none" />
            </Field>
            <button type="submit" className="w-full py-3.5 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--glow-primary)] hover:scale-[1.01] transition">
              Отправить заявку
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Отправляя форму, ты соглашаешься, что я свяжусь с тобой по указанному контакту.
            </p>
          </form>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 mt-10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>{s.footerText}</div>
          <div className="flex items-center gap-3">
            {s.contactTg && <a href={`https://t.me/${s.contactTg.replace(/^@/, "")}`} target="_blank" className="hover:text-foreground transition">Telegram</a>}
            {s.contactDc && <span>· {s.contactDc}</span>}
            <span>·</span>
            <a href="/admin" className="hover:text-foreground transition">Админ</a>
          </div>
        </div>
      </footer>

      <style>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: oklch(1 0 0 / 0.04);
          border: 1px solid oklch(1 0 0 / 0.1);
          border-radius: 0.75rem;
          color: var(--foreground);
          outline: none;
          transition: all 0.2s;
          font: inherit;
        }
        .input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px oklch(0.68 0.22 295 / 0.2);
        }
        .input::placeholder { color: var(--muted-foreground); opacity: 0.6; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">{label}</span>
      {children}
    </label>
  );
}
