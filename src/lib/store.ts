import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  old_price: number | null;
  features: string[];
  highlighted: boolean;
  sort_order: number;
};

export type SiteSettings = Record<string, string>;

export type Ticket = {
  id: string;
  contact_type: "telegram" | "discord";
  contact: string;
  service_id: string | null;
  budget: string;
  message: string;
  created_at: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Heroxxz",
  tagline: "Веб-разработка под ключ",
  heroBadge: "Свободен для новых проектов",
  heroTitle1: "Лендинги и сайты,",
  heroTitle2: "которые продают",
  heroLead: "Делаю быстрые, стильные и удобные сайты. От идеи до публикации — за несколько дней.",
  stat1V: "50+", stat1L: "проектов",
  stat2V: "3–5", stat2L: "дней на лендинг",
  stat3V: "24/7", stat3L: "на связи",
  contactTg: "@heroxxz",
  contactDc: "heroxxz",
  footerText: "© Heroxxz — все права защищены",
};

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function fetchSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("key,value");
  if (error) throw error;
  const out: SiteSettings = { ...DEFAULT_SETTINGS };
  for (const row of data ?? []) {
    const v = (row as { key: string; value: unknown }).value;
    out[(row as { key: string }).key] = typeof v === "string" ? v : String(v ?? "");
  }
  return out;
}

export async function submitTicket(t: Omit<Ticket, "id" | "created_at">) {
  const { error } = await supabase.from("tickets").insert({
    contact_type: t.contact_type,
    contact: t.contact,
    service_id: t.service_id,
    budget: t.budget,
    message: t.message,
  });
  if (error) throw error;
}

const AKEY = "heroxxz_admin_pwd";

export function getAdminPwd(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AKEY);
}
export function setAdminPwd(pwd: string) {
  localStorage.setItem(AKEY, pwd);
}
export function clearAdminPwd() {
  localStorage.removeItem(AKEY);
}
