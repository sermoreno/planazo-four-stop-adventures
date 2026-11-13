ALTER TABLE public.itineraries ADD COLUMN preferences_snapshot jsonb;
ALTER TABLE public.itinerary_items ADD COLUMN duration_min integer;
COMMENT ON COLUMN public.itineraries.preferences_snapshot IS 'Original preferences retained when reopening a saved plan';
COMMENT ON COLUMN public.itinerary_items.duration_min IS 'Scheduled activity duration, not the catalog default';