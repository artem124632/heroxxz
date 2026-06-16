CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  old_price INTEGER,
  features TEXT[] NOT NULL DEFAULT '{}',
  highlighted BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read services" ON public.services FOR SELECT USING (true);

CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON public.site_settings FOR SELECT USING (true);

CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_type TEXT NOT NULL CHECK (contact_type IN ('telegram','discord')),
  contact TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  budget TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.tickets TO anon;
GRANT INSERT ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit tickets" ON public.tickets FOR INSERT WITH CHECK (true);

INSERT INTO public.site_settings (key, value) VALUES
  ('siteName', '"Heroxxz"'::jsonb),
  ('tagline', '"Веб-разработка под ключ"'::jsonb),
  ('heroBadge', '"Свободен для новых проектов"'::jsonb),
  ('heroTitle1', '"Лендинги и сайты,"'::jsonb),
  ('heroTitle2', '"которые продают"'::jsonb),
  ('heroLead', '"Делаю быстрые, стильные и удобные сайты. От идеи до публикации — за несколько дней."'::jsonb),
  ('stat1V', '"50+"'::jsonb), ('stat1L', '"проектов"'::jsonb),
  ('stat2V', '"3–5"'::jsonb), ('stat2L', '"дней на лендинг"'::jsonb),
  ('stat3V', '"24/7"'::jsonb), ('stat3L', '"на связи"'::jsonb),
  ('contactTg', '"@heroxxz"'::jsonb),
  ('contactDc', '"heroxxz"'::jsonb),
  ('footerText', '"© Heroxxz — все права защищены"'::jsonb);

INSERT INTO public.services (title, description, price, old_price, features, highlighted, sort_order) VALUES
  ('Лендинг', 'Одностраничный сайт под продукт или услугу', 15000, 20000, ARRAY['Адаптив','Анимации','Форма заявки','Деплой'], false, 1),
  ('Многостраничный сайт', 'Полноценный сайт с разделами и админкой', 35000, 45000, ARRAY['До 8 страниц','Админ-панель','SEO-оптимизация','Интеграции'], true, 2),
  ('Доработка', 'Допилю существующий сайт или починю баги', 5000, NULL, ARRAY['Правки дизайна','Новые блоки','Оптимизация','Багфиксы'], false, 3);