CREATE OR REPLACE FUNCTION public.validate_baby_memory()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.media_type NOT IN ('photo', 'image', 'video') THEN
    RAISE EXCEPTION 'Invalid media type';
  END IF;
  RETURN NEW;
END;
$$;