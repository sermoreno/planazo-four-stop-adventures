CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','live')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_subscription_read ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY service_subscription_manage ON public.subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_stripe_id_idx ON public.subscriptions(stripe_subscription_id);
CREATE INDEX subscriptions_user_environment_idx ON public.subscriptions(user_id, environment, created_at DESC);

CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (auth.uid() = user_uuid OR auth.role() = 'service_role') AND EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND environment = check_env
      AND price_id = 'planazo_premium_monthly'
      AND (
        (status IN ('active','trialing','past_due') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  );
$$;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid,text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.limit_saved_plans()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text));
  IF (SELECT count(*) FROM public.itineraries WHERE user_id = NEW.user_id) >= 3
    AND NOT public.has_active_subscription(NEW.user_id, 'sandbox')
    AND NOT public.has_active_subscription(NEW.user_id, 'live') THEN
    RAISE EXCEPTION 'Gratis permite 3 planes guardados. Hazte Premium por 4,99 €/mes para guardar planes sin límite.';
  END IF;
  RETURN NEW;
END;
$$;