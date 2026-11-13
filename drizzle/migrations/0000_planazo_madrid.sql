CREATE TABLE public.profiles(id uuid primary key references auth.users(id) on delete cascade, display_name text default '', home_city text default 'Madrid', plan_tier text default 'free', created_at timestamptz default now());
GRANT SELECT,UPDATE ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_profile ON public.profiles FOR SELECT TO authenticated USING(id=auth.uid());
GRANT UPDATE(display_name,home_city) ON public.profiles TO authenticated; REVOKE UPDATE ON public.profiles FROM authenticated; GRANT UPDATE(display_name,home_city) ON public.profiles TO authenticated;
CREATE POLICY edit_profile ON public.profiles FOR UPDATE TO authenticated USING(id=auth.uid()) WITH CHECK(id=auth.uid());
CREATE FUNCTION public.new_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO public.profiles(id,display_name) VALUES(new.id,coalesce(new.raw_user_meta_data->>'display_name','')); RETURN new; END $$;
CREATE TRIGGER create_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.new_profile();
CREATE TABLE public.places(id uuid primary key default gen_random_uuid(), name text not null, category text not null, description text default '', address text default '', lat float8 not null, lng float8 not null, neighborhood text not null, price_level int default 0 check(price_level between 0 and 4), avg_cost_eur numeric not null default 0, avg_duration_min int default 60, opening_hours jsonb default '{"sat":[10,20],"sun":[10,20]}', indoor bool default false, tags text[] default '{}', external_url text default '', is_verified bool default false);
GRANT SELECT ON public.places TO anon,authenticated; GRANT ALL ON public.places TO service_role; ALTER TABLE public.places ENABLE ROW LEVEL SECURITY; CREATE POLICY public_places ON public.places FOR SELECT USING(true);
CREATE TABLE public.preferences(id uuid primary key default gen_random_uuid(),user_id uuid not null, date_range daterange,companions text,budget_pp numeric,pace text,interests text[],mood_text text,constraints jsonb,created_at timestamptz default now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.preferences TO authenticated; GRANT ALL ON public.preferences TO service_role; ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY; CREATE POLICY own_preferences ON public.preferences FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TABLE public.itineraries(id uuid primary key default gen_random_uuid(),user_id uuid not null,preference_id uuid references public.preferences(id),title text not null,plan_date date,total_cost numeric default 0,status text default 'saved',share_slug text unique default encode(gen_random_bytes(12),'hex'),is_public bool default false,created_at timestamptz default now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.itineraries TO authenticated; GRANT ALL ON public.itineraries TO service_role; ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY; CREATE POLICY own_itinerary ON public.itineraries FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE FUNCTION public.limit_saved_plans() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN PERFORM pg_advisory_xact_lock(hashtext(new.user_id::text)); IF (SELECT plan_tier FROM public.profiles WHERE id=new.user_id)='free' AND (SELECT count(*) FROM public.itineraries WHERE user_id=new.user_id)>=3 THEN RAISE EXCEPTION 'Gratis permite 3 planes guardados. Premium 4,99 €/mes (próximamente).'; END IF; RETURN new; END $$;
CREATE TRIGGER saved_limit BEFORE INSERT ON public.itineraries FOR EACH ROW EXECUTE FUNCTION public.limit_saved_plans();
CREATE TABLE public.itinerary_items(id uuid primary key default gen_random_uuid(),itinerary_id uuid not null references public.itineraries(id) on delete cascade,place_id uuid not null references public.places(id),position int,start_time time,end_time time,reason text,est_cost numeric,travel_min_from_prev int default 0,verify_note text default 'Confirma horario y precio');
GRANT SELECT,INSERT,UPDATE,DELETE ON public.itinerary_items TO authenticated; GRANT ALL ON public.itinerary_items TO service_role; ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY; CREATE POLICY own_items ON public.itinerary_items FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM public.itineraries i WHERE i.id=itinerary_id AND i.user_id=auth.uid())) WITH CHECK(EXISTS(SELECT 1 FROM public.itineraries i WHERE i.id=itinerary_id AND i.user_id=auth.uid()));
CREATE TABLE public.chat_messages(id uuid primary key default gen_random_uuid(),itinerary_id uuid references public.itineraries(id) on delete cascade,role text,content text,created_at timestamptz default now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.chat_messages TO authenticated; GRANT ALL ON public.chat_messages TO service_role; ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY; CREATE POLICY own_chat ON public.chat_messages FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM public.itineraries i WHERE i.id=itinerary_id AND i.user_id=auth.uid())) WITH CHECK(EXISTS(SELECT 1 FROM public.itineraries i WHERE i.id=itinerary_id AND i.user_id=auth.uid()));
CREATE TABLE public.geocode_cache(query text primary key,lat float8,lng float8,updated_at timestamptz default now()); GRANT ALL ON public.geocode_cache TO service_role; ALTER TABLE public.geocode_cache ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.read_shared_plan(slug text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT jsonb_build_object('id',i.id,'title',i.title,'plan_date',i.plan_date,'total_cost',i.total_cost,'items',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.position),'[]'::jsonb) FROM public.itinerary_items t WHERE t.itinerary_id=i.id)) FROM public.itineraries i WHERE i.share_slug=slug AND i.is_public=true LIMIT 1 $$; REVOKE ALL ON FUNCTION public.read_shared_plan(text) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.read_shared_plan(text) TO anon,authenticated;
INSERT INTO public.places(name,category,lat,lng,neighborhood,avg_cost_eur,avg_duration_min,indoor,external_url) VALUES
('Parque del Retiro','naturaleza',40.4153,-3.6844,'Madrid centro',0,75,false,'https://www.esmadrid.com/informacion-turistica/parque-del-retiro'),
('Museo del Prado','cultura',40.4138,-3.6921,'Madrid centro',15,90,true,'https://www.museodelprado.es'),
('Real Jardín Botánico','naturaleza',40.4114,-3.6908,'Madrid centro',4,60,false,'https://rjb.csic.es'),
('Museo Reina Sofía','cultura',40.408,-3.6944,'Madrid centro',12,90,true,'https://www.museoreinasofia.es'),
('CaixaForum Madrid','cultura',40.411,-3.6934,'Madrid centro',6,60,true,'https://caixaforum.org/es/madrid'),
('Mercado de Antón Martín','gastronomía',40.4119,-3.6997,'Madrid centro',15,60,true,'https://www.mercadoantonmartin.com'),
('La Casa Encendida','cultura',40.4062,-3.6997,'Madrid centro',0,60,true,'https://www.lacasaencendida.es'),
('Cuesta de Moyano','mercadillos',40.4096,-3.6917,'Madrid centro',0,40,false,'https://www.esmadrid.com'),
('Templo de Debod','cultura',40.424,-3.7177,'Madrid oeste',0,45,false,'https://www.esmadrid.com/informacion-turistica/templo-de-debod'),
('Palacio Real de Madrid','cultura',40.4179,-3.7143,'Madrid oeste',14,90,true,'https://www.patrimonionacional.es'),
('Jardines de Sabatini','naturaleza',40.4205,-3.7134,'Madrid oeste',0,45,false,'https://www.esmadrid.com'),
('Mercado de San Miguel','gastronomía',40.4154,-3.7089,'Madrid oeste',20,60,true,'https://mercadodesanmiguel.es'),
('Plaza Mayor','cultura',40.4154,-3.7074,'Madrid oeste',0,30,false,'https://www.esmadrid.com'),
('Madrid Río','deporte',40.401,-3.7215,'Madrid oeste',0,90,false,'https://www.esmadrid.com'),
('Casa de Campo','naturaleza',40.4195,-3.7565,'Madrid oeste',0,90,false,'https://www.esmadrid.com'),
('El Rastro','mercadillos',40.408,-3.707,'Madrid oeste',0,60,false,'https://www.esmadrid.com'),
('Museo de Historia de Madrid','cultura',40.4259,-3.7005,'Madrid norte',0,60,true,'https://www.esmadrid.com'),
('Mercado de San Ildefonso','gastronomía',40.4241,-3.701,'Madrid norte',18,60,true,'https://www.mercadodesanildefonso.com'),
('Parque del Oeste','naturaleza',40.4295,-3.7235,'Madrid oeste',0,75,false,'https://www.esmadrid.com'),
('Círculo de Bellas Artes','cultura',40.4185,-3.6966,'Madrid centro',5,60,true,'https://www.circulobellasartes.com'),
('Monasterio de El Escorial','cultura',40.5893,-4.1477,'El Escorial',14,90,true,'https://www.patrimonionacional.es'),
('Jardín de los Frailes','naturaleza',40.5881,-4.1479,'El Escorial',0,45,false,'https://www.patrimonionacional.es'),
('Casita del Príncipe','cultura',40.5856,-4.1357,'El Escorial',5,45,true,'https://www.patrimonionacional.es'),
('Plaza de la Constitución de San Lorenzo','gastronomía',40.5915,-4.147,'El Escorial',18,60,false,'https://www.sanlorenzoturismo.es'),
('Castillo de Manzanares el Real','cultura',40.726,-3.862,'Sierra de Guadarrama',5,60,true,'https://www.comunidad.madrid/cultura/patrimonio-cultural'),
('Embalse de Santillana','naturaleza',40.721,-3.857,'Sierra de Guadarrama',0,75,false,'https://www.turismomanzanareselreal.es'),
('Plaza del Pueblo de Manzanares','gastronomía',40.727,-3.864,'Sierra de Guadarrama',18,60,false,'https://www.turismomanzanareselreal.es'),
('La Pedriza, Canto Cochino','deporte',40.750,-3.895,'Sierra de Guadarrama',0,120,false,'https://www.parquenacionalsierraguadarrama.es'),
('Real Monasterio de Santa María de El Paular','cultura',40.888,-3.887,'Rascafría',7,60,true,'https://monasteriopaular.com'),
('Puente del Perdón','naturaleza',40.887,-3.884,'Rascafría',0,45,false,'https://www.turismorascafria.es'),
('Las Presillas','naturaleza',40.878,-3.880,'Rascafría',0,90,false,'https://www.turismorascafria.es'),
('Plaza de la Villa de Rascafría','gastronomía',40.904,-3.879,'Rascafría',20,60,false,'https://www.turismorascafria.es'),
('Universidad de Alcalá','cultura',40.482,-3.363,'Alcalá de Henares',6,60,true,'https://www.uah.es'),
('Casa Natal de Cervantes','cultura',40.482,-3.367,'Alcalá de Henares',0,45,true,'https://www.museocasanataldecervantes.org'),
('Plaza de Cervantes','naturaleza',40.481,-3.364,'Alcalá de Henares',0,45,false,'https://www.turismoalcala.es'),
('Calle Mayor de Alcalá','gastronomía',40.482,-3.366,'Alcalá de Henares',18,60,false,'https://www.turismoalcala.es'),
('Palacio Real de Aranjuez','cultura',40.036,-3.608,'Aranjuez',9,90,true,'https://www.patrimonionacional.es'),
('Jardín de la Isla','naturaleza',40.037,-3.609,'Aranjuez',0,60,false,'https://www.patrimonionacional.es'),
('Jardín del Príncipe','naturaleza',40.036,-3.589,'Aranjuez',0,90,false,'https://www.patrimonionacional.es'),
('Mercado de Abastos de Aranjuez','gastronomía',40.031,-3.604,'Aranjuez',18,60,true,'https://www.aranjuez.es');
UPDATE public.places SET tags=ARRAY[category], description='Lugar de la provincia de Madrid. Horarios y precios estimados; consulta la web oficial.',address=neighborhood||', Comunidad de Madrid';
UPDATE public.places SET opening_hours='{"sat":[],"sun":[9,15]}' WHERE name='El Rastro';