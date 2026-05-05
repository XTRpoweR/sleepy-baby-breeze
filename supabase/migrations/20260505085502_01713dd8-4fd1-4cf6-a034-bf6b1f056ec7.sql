DROP VIEW IF EXISTS public.marketing_funnel_summary;

CREATE VIEW public.marketing_funnel_summary
WITH (security_invoker = true) AS
SELECT date(marketing_events.created_at) AS event_date,
    marketing_events.utm_source,
    marketing_events.utm_campaign,
    marketing_events.event_name,
    count(*) AS event_count,
    count(DISTINCT marketing_events.email) AS unique_users,
    sum(marketing_events.value) AS total_value,
    avg(marketing_events.value) AS avg_value
FROM public.marketing_events
WHERE (marketing_events.created_at >= (now() - '90 days'::interval))
GROUP BY (date(marketing_events.created_at)), marketing_events.utm_source, marketing_events.utm_campaign, marketing_events.event_name
ORDER BY (date(marketing_events.created_at)) DESC, (count(*)) DESC;

REVOKE ALL ON public.marketing_funnel_summary FROM PUBLIC, anon;
GRANT SELECT ON public.marketing_funnel_summary TO authenticated, service_role;