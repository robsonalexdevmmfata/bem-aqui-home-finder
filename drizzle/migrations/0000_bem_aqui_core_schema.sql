
-- ===================== ENUMS =====================
CREATE TYPE public.app_role AS ENUM ('admin','broker','agency','client');
CREATE TYPE public.account_status AS ENUM ('pending','approved','rejected','suspended');
CREATE TYPE public.property_status AS ENUM ('draft','pending','published','rejected','archived');
CREATE TYPE public.property_purpose AS ENUM ('venda','aluguel');
CREATE TYPE public.proposal_type AS ENUM ('compra','aluguel');
CREATE TYPE public.proposal_status AS ENUM ('pending','countered','accepted','rejected','withdrawn');
CREATE TYPE public.lead_status AS ENUM ('new','contacted','qualified','converted','lost');
CREATE TYPE public.partnership_status AS ENUM ('pending','accepted','rejected','ended');
CREATE TYPE public.report_status AS ENUM ('open','reviewing','resolved','dismissed');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ===================== PROFILES & ROLES =====================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  avatar_url text,
  city text,
  account_type public.app_role NOT NULL DEFAULT 'client',
  status public.account_status NOT NULL DEFAULT 'approved',
  lgpd_consent_at timestamptz,
  marketing_consent boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_professional(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('broker','agency','admin'))
$$;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_admin_insert" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===================== ACTIVITY LOGS & NOTIFICATIONS =====================
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_admin_select" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "logs_insert_self" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.notifications (user_id, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notify(_user uuid, _type text, _title text, _body text, _link text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _user IS NULL THEN RETURN; END IF;
  INSERT INTO public.notifications(user_id, type, title, body, link) VALUES (_user, _type, _title, _body, _link);
END $$;
REVOKE EXECUTE ON FUNCTION public.notify(uuid,text,text,text,text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.log_activity(_action text, _entity text, _entity_id uuid, _details jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.activity_logs(actor_id, action, entity, entity_id, details) VALUES (auth.uid(), _action, _entity, _entity_id, coalesce(_details,'{}'::jsonb));
END $$;
REVOKE EXECUTE ON FUNCTION public.log_activity(text,text,uuid,jsonb) FROM PUBLIC, anon, authenticated;

-- ===================== AGENCIES & BROKERS =====================
CREATE TABLE public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL,
  cnpj text,
  creci text,
  email text,
  phone text,
  whatsapp text,
  city text,
  state text,
  logo_url text,
  description text,
  status public.account_status NOT NULL DEFAULT 'pending',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.agencies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agencies TO authenticated;
GRANT ALL ON public.agencies TO service_role;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agencies_public_approved" ON public.agencies FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "agencies_owner_select" ON public.agencies FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "agencies_owner_update" ON public.agencies FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "agencies_admin_insert" ON public.agencies FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR owner_id = auth.uid());
CREATE POLICY "agencies_admin_delete" ON public.agencies FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_agencies_updated BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.brokers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  creci text,
  bio text,
  whatsapp text,
  public_email text,
  photo_url text,
  city text,
  specialties text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  status public.account_status NOT NULL DEFAULT 'pending',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brokers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brokers TO authenticated;
GRANT ALL ON public.brokers TO service_role;
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brokers_public_approved" ON public.brokers FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "brokers_owner_select" ON public.brokers FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "brokers_owner_update" ON public.brokers FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "brokers_admin_insert" ON public.brokers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "brokers_admin_delete" ON public.brokers FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_brokers_updated BEFORE UPDATE ON public.brokers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Guard: only admins change status / featured / account_type
CREATE OR REPLACE FUNCTION public.guard_account_fields() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(),'admin') THEN
    IF TG_TABLE_NAME = 'profiles' AND NEW.status IS DISTINCT FROM OLD.status AND auth.uid() IS NOT NULL THEN
      PERFORM public.log_activity('account_status_changed','profiles',NEW.id, jsonb_build_object('from',OLD.status,'to',NEW.status));
      PERFORM public.notify(NEW.id,'account','Status do cadastro atualizado','Seu cadastro agora está: '||NEW.status::text,'/conta');
    END IF;
    RETURN NEW;
  END IF;
  IF TG_TABLE_NAME = 'profiles' THEN
    NEW.status := OLD.status; NEW.account_type := OLD.account_type; NEW.is_demo := OLD.is_demo; NEW.id := OLD.id;
  ELSIF TG_TABLE_NAME = 'brokers' THEN
    NEW.status := OLD.status; NEW.featured := OLD.featured; NEW.user_id := OLD.user_id; NEW.is_demo := OLD.is_demo;
  ELSIF TG_TABLE_NAME = 'agencies' THEN
    NEW.status := OLD.status; NEW.owner_id := OLD.owner_id; NEW.is_demo := OLD.is_demo;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_profiles_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_account_fields();
CREATE TRIGGER trg_brokers_guard BEFORE UPDATE ON public.brokers FOR EACH ROW EXECUTE FUNCTION public.guard_account_fields();
CREATE TRIGGER trg_agencies_guard BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.guard_account_fields();

-- Role change logging
CREATE OR REPLACE FUNCTION public.log_role_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN coalesce(NEW, OLD); END IF;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_activity('role_granted','user_roles',NEW.user_id, jsonb_build_object('role',NEW.role));
    RETURN NEW;
  ELSE
    PERFORM public.log_activity('role_revoked','user_roles',OLD.user_id, jsonb_build_object('role',OLD.role));
    RETURN OLD;
  END IF;
END $$;
CREATE TRIGGER trg_roles_log AFTER INSERT OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- New user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _type text := coalesce(NEW.raw_user_meta_data->>'account_type','client');
  _name text := coalesce(nullif(NEW.raw_user_meta_data->>'full_name',''), split_part(NEW.email,'@',1));
  _agency uuid;
BEGIN
  IF _type NOT IN ('client','broker','agency') THEN _type := 'client'; END IF;
  INSERT INTO public.profiles(id, full_name, email, phone, account_type, status, lgpd_consent_at)
  VALUES (NEW.id, _name, NEW.email, NEW.raw_user_meta_data->>'phone', _type::public.app_role,
          CASE WHEN _type = 'client' THEN 'approved'::public.account_status ELSE 'pending'::public.account_status END,
          CASE WHEN NEW.raw_user_meta_data->>'lgpd_consent' = 'true' THEN now() END);
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'client');
  IF _type = 'broker' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'broker');
    INSERT INTO public.brokers(user_id, display_name, creci, whatsapp, public_email, status)
    VALUES (NEW.id, _name, NEW.raw_user_meta_data->>'creci', NEW.raw_user_meta_data->>'phone', NEW.email, 'pending');
  ELSIF _type = 'agency' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'agency');
    INSERT INTO public.agencies(owner_id, name, creci, email, phone, status)
    VALUES (NEW.id, coalesce(nullif(NEW.raw_user_meta_data->>'agency_name',''), _name), NEW.raw_user_meta_data->>'creci', NEW.email, NEW.raw_user_meta_data->>'phone', 'pending')
    RETURNING id INTO _agency;
    INSERT INTO public.brokers(user_id, agency_id, display_name, creci, whatsapp, public_email, status)
    VALUES (NEW.id, _agency, coalesce(nullif(NEW.raw_user_meta_data->>'agency_name',''), _name), NEW.raw_user_meta_data->>'creci', NEW.raw_user_meta_data->>'phone', NEW.email, 'pending');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================== CATALOG =====================
CREATE TABLE public.property_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.property_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_categories TO authenticated;
GRANT ALL ON public.property_categories TO service_role;
ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cat_public_read" ON public.property_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cat_admin_insert" ON public.property_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cat_admin_update" ON public.property_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cat_admin_delete" ON public.property_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ===================== PROPERTIES =====================
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  broker_id uuid REFERENCES public.brokers(id) ON DELETE SET NULL,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.property_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  purpose public.property_purpose NOT NULL DEFAULT 'venda',
  price numeric(14,2) NOT NULL DEFAULT 0,
  condo_fee numeric(12,2),
  iptu numeric(12,2),
  area_m2 numeric(10,2),
  bedrooms int NOT NULL DEFAULT 0,
  suites int NOT NULL DEFAULT 0,
  bathrooms int NOT NULL DEFAULT 0,
  parking_spots int NOT NULL DEFAULT 0,
  address text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  status public.property_status NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  is_investment boolean NOT NULL DEFAULT false,
  expected_rent numeric(12,2),
  rejection_reason text,
  is_demo boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.properties (status, purpose, city);
CREATE INDEX ON public.properties (owner_id);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prop_public_published" ON public.properties FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "prop_owner_select" ON public.properties FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "prop_pro_insert" ON public.properties FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.is_professional(auth.uid()));
CREATE POLICY "prop_owner_update" ON public.properties FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "prop_owner_delete" ON public.properties FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.guard_property() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _approved boolean;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.broker_id IS NULL THEN
    SELECT id, agency_id INTO NEW.broker_id, NEW.agency_id FROM public.brokers WHERE user_id = NEW.owner_id LIMIT 1;
  END IF;
  IF auth.uid() IS NULL OR public.has_role(auth.uid(),'admin') THEN
    IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status <> 'published') THEN NEW.published_at := now(); NEW.rejection_reason := NULL; END IF;
    RETURN NEW;
  END IF;
  SELECT status = 'approved' INTO _approved FROM public.profiles WHERE id = auth.uid();
  IF TG_OP = 'INSERT' THEN
    NEW.featured := false; NEW.is_demo := false; NEW.published_at := NULL;
    IF NEW.status NOT IN ('draft','pending') THEN NEW.status := 'draft'; END IF;
  ELSE
    NEW.featured := OLD.featured; NEW.owner_id := OLD.owner_id; NEW.is_demo := OLD.is_demo; NEW.published_at := OLD.published_at;
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status NOT IN ('draft','pending','archived') THEN
      RAISE EXCEPTION 'Somente administradores podem publicar ou rejeitar anúncios';
    END IF;
  END IF;
  IF NEW.status = 'pending' AND NOT coalesce(_approved,false) THEN
    RAISE EXCEPTION 'Seu cadastro profissional ainda está em análise. Salve como rascunho até a aprovação.';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_properties_guard BEFORE INSERT OR UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.guard_property();

CREATE OR REPLACE FUNCTION public.after_property_status() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'published' THEN
      PERFORM public.notify(NEW.owner_id,'property','Anúncio aprovado','"'||NEW.title||'" foi publicado no portal.','/painel/imoveis/'||NEW.id);
    ELSIF NEW.status = 'rejected' THEN
      PERFORM public.notify(NEW.owner_id,'property','Anúncio recusado','"'||NEW.title||'" foi recusado. '||coalesce(NEW.rejection_reason,''),'/painel/imoveis/'||NEW.id);
    END IF;
    IF auth.uid() IS NOT NULL AND public.has_role(auth.uid(),'admin') THEN
      PERFORM public.log_activity('property_status_changed','properties',NEW.id, jsonb_build_object('from',OLD.status,'to',NEW.status,'title',NEW.title));
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_properties_after AFTER UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.after_property_status();

CREATE OR REPLACE FUNCTION public.can_view_property(_pid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.properties p WHERE p.id = _pid AND (p.status = 'published' OR p.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
$$;
CREATE OR REPLACE FUNCTION public.can_manage_property(_pid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.properties p WHERE p.id = _pid AND (p.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
$$;

CREATE TABLE public.property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.property_images (property_id, position);
CREATE TABLE public.property_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.property_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.property_images, public.property_videos, public.property_features TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_images, public.property_videos, public.property_features TO authenticated;
GRANT ALL ON public.property_images, public.property_videos, public.property_features TO service_role;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "img_read" ON public.property_images FOR SELECT TO anon, authenticated USING (public.can_view_property(property_id));
CREATE POLICY "img_write" ON public.property_images FOR INSERT TO authenticated WITH CHECK (public.can_manage_property(property_id));
CREATE POLICY "img_update" ON public.property_images FOR UPDATE TO authenticated USING (public.can_manage_property(property_id)) WITH CHECK (public.can_manage_property(property_id));
CREATE POLICY "img_delete" ON public.property_images FOR DELETE TO authenticated USING (public.can_manage_property(property_id));
CREATE POLICY "vid_read" ON public.property_videos FOR SELECT TO anon, authenticated USING (public.can_view_property(property_id));
CREATE POLICY "vid_write" ON public.property_videos FOR INSERT TO authenticated WITH CHECK (public.can_manage_property(property_id));
CREATE POLICY "vid_update" ON public.property_videos FOR UPDATE TO authenticated USING (public.can_manage_property(property_id)) WITH CHECK (public.can_manage_property(property_id));
CREATE POLICY "vid_delete" ON public.property_videos FOR DELETE TO authenticated USING (public.can_manage_property(property_id));
CREATE POLICY "feat_read" ON public.property_features FOR SELECT TO anon, authenticated USING (public.can_view_property(property_id));
CREATE POLICY "feat_write" ON public.property_features FOR INSERT TO authenticated WITH CHECK (public.can_manage_property(property_id));
CREATE POLICY "feat_update" ON public.property_features FOR UPDATE TO authenticated USING (public.can_manage_property(property_id)) WITH CHECK (public.can_manage_property(property_id));
CREATE POLICY "feat_delete" ON public.property_features FOR DELETE TO authenticated USING (public.can_manage_property(property_id));

CREATE TABLE public.property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.property_views (property_id, created_at);
GRANT INSERT ON public.property_views TO anon;
GRANT SELECT, INSERT ON public.property_views TO authenticated;
GRANT ALL ON public.property_views TO service_role;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "views_insert_any" ON public.property_views FOR INSERT TO anon, authenticated WITH CHECK (public.can_view_property(property_id) AND (viewer_id IS NULL OR viewer_id = auth.uid()));
CREATE POLICY "views_owner_read" ON public.property_views FOR SELECT TO authenticated USING (public.can_manage_property(property_id));

CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, property_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fav_own_select" ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "fav_own_insert" ON public.favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "fav_own_delete" ON public.favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ===================== LEADS =====================
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  owner_id uuid,
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  source text NOT NULL DEFAULT 'site',
  status public.lead_status NOT NULL DEFAULT 'new',
  consent boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.leads (owner_id, created_at DESC);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_public_insert" ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (consent = true AND (user_id IS NULL OR user_id = auth.uid()) AND length(name) BETWEEN 2 AND 120 AND length(email) BETWEEN 5 AND 255);
CREATE POLICY "leads_owner_select" ON public.leads FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "leads_owner_update" ON public.leads FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "leads_owner_delete" ON public.leads FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.before_lead_insert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.property_id IS NOT NULL THEN
    SELECT owner_id INTO NEW.owner_id FROM public.properties WHERE id = NEW.property_id;
  ELSIF auth.uid() IS NOT NULL THEN
    NEW.owner_id := NULL;
  END IF;
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') THEN NEW.status := 'new'; NEW.is_demo := false; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_leads_before BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.before_lead_insert();
CREATE OR REPLACE FUNCTION public.after_lead_insert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify(NEW.owner_id,'lead','Novo interessado', NEW.name||' demonstrou interesse.','/painel/leads');
  RETURN NEW;
END $$;
CREATE TRIGGER trg_leads_after AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.after_lead_insert();

CREATE TABLE public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'nota',
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.lead_notes TO authenticated;
GRANT ALL ON public.lead_notes TO service_role;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.can_manage_lead(_lid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.leads l WHERE l.id = _lid AND (l.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
$$;
CREATE POLICY "ln_select" ON public.lead_notes FOR SELECT TO authenticated USING (public.can_manage_lead(lead_id));
CREATE POLICY "ln_insert" ON public.lead_notes FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND public.can_manage_lead(lead_id));
CREATE POLICY "ln_delete" ON public.lead_notes FOR DELETE TO authenticated USING (author_id = auth.uid());

-- ===================== PROPOSALS & NEGOTIATIONS =====================
CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  owner_id uuid,
  type public.proposal_type NOT NULL DEFAULT 'compra',
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  payment_conditions text,
  message text,
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  status public.proposal_status NOT NULL DEFAULT 'pending',
  last_offer_by uuid,
  agreed_amount numeric(14,2),
  agreed_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.proposals (owner_id);
CREATE INDEX ON public.proposals (client_id);
GRANT SELECT, INSERT, UPDATE ON public.proposals TO authenticated;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prop_participants_select" ON public.proposals FOR SELECT TO authenticated USING (client_id = auth.uid() OR owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "prop_client_insert" ON public.proposals FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "prop_participants_update" ON public.proposals FOR UPDATE TO authenticated USING (client_id = auth.uid() OR owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (client_id = auth.uid() OR owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_proposals_updated BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  author_id uuid,
  kind text NOT NULL DEFAULT 'message',
  amount numeric(14,2),
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.negotiations (proposal_id, created_at);
GRANT SELECT, INSERT ON public.negotiations TO authenticated;
GRANT ALL ON public.negotiations TO service_role;
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.is_proposal_participant(_pid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = _pid AND (p.client_id = auth.uid() OR p.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
$$;
CREATE POLICY "neg_select" ON public.negotiations FOR SELECT TO authenticated USING (public.is_proposal_participant(proposal_id));
CREATE POLICY "neg_insert_message" ON public.negotiations FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND kind = 'message' AND public.is_proposal_participant(proposal_id));

CREATE OR REPLACE FUNCTION public.guard_proposal() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _status public.property_status;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT owner_id, status INTO NEW.owner_id, _status FROM public.properties WHERE id = NEW.property_id;
    IF _uid IS NOT NULL THEN
      IF _status IS DISTINCT FROM 'published' THEN RAISE EXCEPTION 'Este imóvel não está disponível para propostas'; END IF;
      IF NEW.owner_id = _uid THEN RAISE EXCEPTION 'Você não pode enviar proposta para o próprio imóvel'; END IF;
      NEW.status := 'pending'; NEW.agreed_amount := NULL; NEW.agreed_at := NULL; NEW.is_demo := false;
    END IF;
    NEW.last_offer_by := NEW.client_id;
    RETURN NEW;
  END IF;
  IF _uid IS NULL OR public.has_role(_uid,'admin') THEN RETURN NEW; END IF;
  NEW.client_id := OLD.client_id; NEW.owner_id := OLD.owner_id; NEW.property_id := OLD.property_id; NEW.is_demo := OLD.is_demo;
  IF OLD.status IN ('accepted','rejected','withdrawn') AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Esta negociação já foi encerrada';
  END IF;
  IF NEW.status = 'countered' THEN
    IF NEW.amount IS NULL OR NEW.amount <= 0 THEN RAISE EXCEPTION 'Informe o valor da contraproposta'; END IF;
    NEW.last_offer_by := _uid;
  ELSIF NEW.status IN ('accepted','rejected') AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.last_offer_by = _uid THEN RAISE EXCEPTION 'Aguarde a resposta da outra parte'; END IF;
    NEW.amount := OLD.amount;
    IF NEW.status = 'accepted' THEN NEW.agreed_amount := OLD.amount; NEW.agreed_at := now(); END IF;
  ELSIF NEW.status = 'withdrawn' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF _uid <> OLD.client_id THEN RAISE EXCEPTION 'Somente o proponente pode retirar a proposta'; END IF;
    NEW.amount := OLD.amount;
  ELSE
    NEW.amount := OLD.amount; NEW.status := OLD.status; NEW.last_offer_by := OLD.last_offer_by;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_proposals_guard BEFORE INSERT OR UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.guard_proposal();

CREATE OR REPLACE FUNCTION public.after_proposal() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _title text; _other uuid; _actor uuid := coalesce(auth.uid(), NEW.last_offer_by);
BEGIN
  SELECT title INTO _title FROM public.properties WHERE id = NEW.property_id;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.negotiations(proposal_id, author_id, kind, amount, message) VALUES (NEW.id, NEW.client_id, 'created', NEW.amount, NEW.message);
    PERFORM public.notify(NEW.owner_id,'proposal','Nova proposta recebida', NEW.client_name||' enviou uma proposta para "'||coalesce(_title,'imóvel')||'".','/painel/propostas/'||NEW.id);
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status OR NEW.amount IS DISTINCT FROM OLD.amount THEN
    INSERT INTO public.negotiations(proposal_id, author_id, kind, amount, message)
    VALUES (NEW.id, _actor, NEW.status::text, NEW.amount, NULL);
    _other := CASE WHEN _actor = NEW.client_id THEN NEW.owner_id ELSE NEW.client_id END;
    PERFORM public.notify(_other,'proposal','Atualização na negociação','Proposta para "'||coalesce(_title,'imóvel')||'": '||NEW.status::text,
      CASE WHEN _other = NEW.owner_id THEN '/painel/propostas/'||NEW.id ELSE '/conta/propostas/'||NEW.id END);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_proposals_after AFTER INSERT OR UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.after_proposal();

-- ===================== PARTNERSHIPS =====================
CREATE TABLE public.partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  partner_broker_id uuid NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  partner_user_id uuid,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  commission_split numeric(5,2) NOT NULL DEFAULT 50 CHECK (commission_split >= 0 AND commission_split <= 100),
  message text,
  status public.partnership_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partnerships TO authenticated;
GRANT ALL ON public.partnerships TO service_role;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "part_select" ON public.partnerships FOR SELECT TO authenticated USING (requester_id = auth.uid() OR partner_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "part_insert" ON public.partnerships FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid() AND public.is_professional(auth.uid()));
CREATE POLICY "part_update" ON public.partnerships FOR UPDATE TO authenticated USING (requester_id = auth.uid() OR partner_user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (requester_id = auth.uid() OR partner_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_part_updated BEFORE UPDATE ON public.partnerships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE FUNCTION public.partnership_events() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO NEW.partner_user_id FROM public.brokers WHERE id = NEW.partner_broker_id;
    IF NEW.partner_user_id = NEW.requester_id THEN RAISE EXCEPTION 'Selecione outro corretor para a parceria'; END IF;
    NEW.status := 'pending';
    PERFORM public.notify(NEW.partner_user_id,'partnership','Novo convite de parceria','Você recebeu uma proposta de parceria.','/painel/parcerias');
  ELSE
    NEW.requester_id := OLD.requester_id; NEW.partner_user_id := OLD.partner_user_id; NEW.partner_broker_id := OLD.partner_broker_id;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status IN ('accepted','rejected') AND auth.uid() IS NOT NULL AND auth.uid() <> OLD.partner_user_id AND NOT public.has_role(auth.uid(),'admin') THEN
        RAISE EXCEPTION 'Somente o corretor convidado pode responder';
      END IF;
      PERFORM public.notify(CASE WHEN auth.uid() = OLD.requester_id THEN OLD.partner_user_id ELSE OLD.requester_id END,'partnership','Parceria atualizada','Status: '||NEW.status::text,'/painel/parcerias');
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_part_events BEFORE INSERT OR UPDATE ON public.partnerships FOR EACH ROW EXECUTE FUNCTION public.partnership_events();

-- ===================== TOOLS (saved by user) =====================
CREATE TABLE public.financial_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'Simulação',
  inputs jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.investment_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'Análise',
  inputs jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.property_valuations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'Projeção',
  inputs jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.financial_simulations, public.investment_analyses, public.property_valuations TO authenticated;
GRANT ALL ON public.financial_simulations, public.investment_analyses, public.property_valuations TO service_role;
ALTER TABLE public.financial_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_valuations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fs_own_select" ON public.financial_simulations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "fs_own_insert" ON public.financial_simulations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "fs_own_delete" ON public.financial_simulations FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ia_own_select" ON public.investment_analyses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ia_own_insert" ON public.investment_analyses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ia_own_delete" ON public.investment_analyses FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pv_own_select" ON public.property_valuations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pv_own_insert" ON public.property_valuations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pv_own_delete" ON public.property_valuations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ===================== CMS: banners, partners, testimonials, reports =====================
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  link_url text,
  position int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  website text,
  position int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text,
  content text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  active boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners, public.partners, public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners, public.partners, public.testimonials TO authenticated;
GRANT ALL ON public.banners, public.partners, public.testimonials TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ban_read" ON public.banners FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ban_admin_ins" ON public.banners FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "ban_admin_upd" ON public.banners FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "ban_admin_del" ON public.banners FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "par_read" ON public.partners FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "par_admin_ins" ON public.partners FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "par_admin_upd" ON public.partners FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "par_admin_del" ON public.partners FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "tes_read" ON public.testimonials FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "tes_admin_ins" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "tes_admin_upd" ON public.testimonials FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "tes_admin_del" ON public.testimonials FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  reporter_id uuid,
  reporter_email text,
  reason text NOT NULL,
  details text,
  status public.report_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rep_insert" ON public.reports FOR INSERT TO anon, authenticated WITH CHECK ((reporter_id IS NULL OR reporter_id = auth.uid()) AND status = 'open' AND length(reason) BETWEEN 3 AND 200);
CREATE POLICY "rep_admin_select" ON public.reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "rep_admin_update" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "rep_admin_delete" ON public.reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ===================== ADMIN STATS / PUBLIC HELPERS =====================
CREATE OR REPLACE FUNCTION public.admin_stats() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN jsonb_build_object(
    'users', (SELECT count(*) FROM public.profiles),
    'brokers', (SELECT count(*) FROM public.brokers WHERE user_id IS NOT NULL),
    'agencies', (SELECT count(*) FROM public.agencies),
    'properties', (SELECT count(*) FROM public.properties),
    'published', (SELECT count(*) FROM public.properties WHERE status = 'published'),
    'pending', (SELECT count(*) FROM public.properties WHERE status = 'pending'),
    'proposals', (SELECT count(*) FROM public.proposals),
    'leads', (SELECT count(*) FROM public.leads),
    'pending_accounts', (SELECT count(*) FROM public.profiles WHERE status = 'pending'),
    'open_reports', (SELECT count(*) FROM public.reports WHERE status = 'open')
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;

-- ===================== STORAGE POLICIES =====================
CREATE POLICY "media_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media_owner_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'property-media' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "media_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'property-media' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
