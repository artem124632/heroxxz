import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_PASSWORD = "oearh2026";

function checkPwd(pwd: string) {
  if (pwd !== ADMIN_PASSWORD) throw new Error("Неверный пароль");
}

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().default(""),
  price: z.number().int().min(0),
  old_price: z.number().int().min(0).nullable().optional(),
  features: z.array(z.string()),
  highlighted: z.boolean(),
  sort_order: z.number().int().default(0),
});

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => z.object({ password: z.string() }).parse(d))
  .handler(async ({ data }) => {
    return { ok: data.password === ADMIN_PASSWORD };
  });

export const upsertService = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; service: z.infer<typeof serviceSchema> }) =>
    z.object({ password: z.string(), service: serviceSchema }).parse(d)
  )
  .handler(async ({ data }) => {
    checkPwd(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      title: data.service.title,
      description: data.service.description,
      price: data.service.price,
      old_price: data.service.old_price ?? null,
      features: data.service.features,
      highlighted: data.service.highlighted,
      sort_order: data.service.sort_order,
    };
    if (data.service.id) {
      const { error } = await supabaseAdmin.from("services").update(row).eq("id", data.service.id);
      if (error) throw new Error(error.message);
      return { id: data.service.id };
    } else {
      const { data: inserted, error } = await supabaseAdmin.from("services").insert(row).select("id").single();
      if (error) throw new Error(error.message);
      return { id: inserted.id };
    }
  });

export const deleteService = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) =>
    z.object({ password: z.string(), id: z.string().uuid() }).parse(d)
  )
  .handler(async ({ data }) => {
    checkPwd(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; settings: Record<string, string> }) =>
    z.object({ password: z.string(), settings: z.record(z.string(), z.string()) }).parse(d)
  )
  .handler(async ({ data }) => {
    checkPwd(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = Object.entries(data.settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTickets = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => z.object({ password: z.string() }).parse(d))
  .handler(async ({ data }) => {
    checkPwd(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows;
  });

export const deleteTicket = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) =>
    z.object({ password: z.string(), id: z.string().uuid() }).parse(d)
  )
  .handler(async ({ data }) => {
    checkPwd(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tickets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
