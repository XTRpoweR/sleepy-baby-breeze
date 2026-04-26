## Goals

1. Remove the word "expert/experts" (and its translations) from the welcome email and across the entire site, replacing it with a more attractive but truthful phrase.
2. Fix the issue where unsubscribing does NOT send a notification to `support@sleepybabyy.com`.

---

## 1. Replace "expert" wording

The word "expert" (and its localized variants) currently appears in:

- `supabase/functions/newsletter-subscribe/index.ts` — in 8 languages (intro paragraph + `feat1Desc`).
- `src/locales/{en,de,es,fr,it,el,fi,sv}/common.json` — line 97 (`description` for the Sounds feature card).

### Replacement wording (per language)

Instead of "expert" we will use phrasing built around **"science-backed", "carefully curated", "trusted by parents", "parent-approved"** — accurate and more engaging.

| Lang | Old fragment | New fragment |
|------|--------------|--------------|
| EN | "expert tips, science-backed insights" → | "science-backed tips, carefully curated insights" |
| EN | "Curated advice from pediatric sleep experts" → | "Carefully curated, science-backed advice" |
| EN | "expert-backed sleep tips" (locales) → | "science-backed sleep tips trusted by parents" |
| DE | "Experten-Tipps" / "Schlafexperten" → | "wissenschaftlich fundierte Tipps" / "sorgfältig ausgewählte Schlaftipps" |
| ES | "consejos de expertos" / "expertos en sueño infantil" → | "consejos basados en la ciencia" / "consejos cuidadosamente seleccionados sobre el sueño infantil" |
| FR | "conseils d'experts" / "experts du sommeil pédiatrique" → | "conseils fondés sur la science" / "conseils soigneusement sélectionnés sur le sommeil" |
| IT | (no "esperti" found, will double-check) | — |
| EL | "από ειδικούς" → | "βασισμένες στην επιστήμη" |
| FI | "asiantuntijavinkkejä" / "uniasiantuntijoilta" → | "tieteeseen perustuvia univinkkejä" / "huolellisesti valittuja univinkkejä" |
| SV | "expertråd" / "barnsömnsexperter" / "expertbackade" → | "vetenskapligt underbyggda råd" / "noggrant utvalda sömnråd" |

The Arabic message uses "خبراء" — Arabic isn't currently shipped as a locale file, so no `.json` change needed there; only English/EU languages are touched.

---

## 2. Fix admin notification on unsubscribe

### Root cause

Looking at `src/pages/Unsubscribe.tsx`, the page **requires the user to click "Confirm Unsubscribe"** before calling the `newsletter-unsubscribe` Edge Function. Many users (and most email clients' anti-spam scanners) expect the unsubscribe link to work **instantly** when opened. If the user closed the tab without pressing the button, no request was sent → no admin email.

Additionally, the Edge Function logs show no invocations at all, confirming the request never reached the server in the user's last test.

### Fix

1. **Auto-trigger unsubscribe on page mount** when a `token` (or `email`) is present in the URL. Show a loader → success state. Keep a "Resubscribe" link to home as the only action. This is the standard newsletter UX and guarantees the admin notification fires.
2. Keep the manual "Confirm" button only as a fallback if the auto-call fails.
3. Re-deploy `newsletter-unsubscribe` to ensure the latest version (with `support@sleepybabyy.com` notification) is live.
4. Verify the admin email in `newsletter-unsubscribe/index.ts` is sent with the same verified `from` domain (`noreply@sleepybabyy.com`) as the working subscribe notification — already correct, so no change there.

### Files touched

- `supabase/functions/newsletter-subscribe/index.ts` — wording for 8 languages.
- `src/locales/{en,de,es,fr,el,fi,sv}/common.json` — Sounds feature description wording.
- `src/pages/Unsubscribe.tsx` — auto-fire unsubscribe on mount; simplified UX.
- Re-deploy `newsletter-subscribe` and `newsletter-unsubscribe` Edge Functions.

---

## What you'll see after approval

- The welcome email no longer says "expert" in any language; it uses phrases like "science-backed" / "carefully curated" instead.
- Clicking the unsubscribe link in any newsletter email will instantly unsubscribe you and immediately send a notification to `support@sleepybabyy.com` with the unsubscriber's email, language, IP, and user-agent.
