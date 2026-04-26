## Goal

Improve the newsletter system with:
1. Better-designed welcome email with logo at the top
2. Localized emails matching the user's app language
3. Admin notifications to `support@sleepybabyy.com` on subscribe and unsubscribe
4. Cleaner unsubscribe link in the footer (already exists, will be polished)

---

## 1. Pass user language to the Edge Function

**`src/hooks/useNewsletterSubscription.tsx`**: Read the current language from `i18next` (`i18n.language`) and pass it in the request body as `language`.

**`src/components/NewsletterSubscription.tsx`**: No change needed (the hook handles it).

Supported languages: `en`, `de`, `es`, `fr`, `it`, `el`, `fi`, `sv` (matching the project's existing i18n setup). Default to `en` if missing/unknown.

---

## 2. Redesign the welcome email (multi-language)

**`supabase/functions/newsletter-subscribe/index.ts`**:

- Add a `LOCALES` map containing translated strings for: title, greeting, intro, 3 feature bullets, CTA button, footer signature, "sent to" line, and unsubscribe text — for all 8 supported languages.
- Replace the current `welcomeEmailHtml` with a cleaner, more polished design:
  - **Logo at the top, centered**: `<img src="https://sleepybabyy.com/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="SleepyBabyy" width="140">` inside a soft branded hero band
  - Smaller, balanced moon emoji + tagline
  - Tighter, modern card layout (subtle shadow, rounded corners, more breathing room)
  - Clean typography hierarchy (smaller heading, no oversized emoji blocks)
  - Properly styled feature list (no awkward sparkle floating in mid-card)
  - Prominent gradient CTA button → blog
  - Footer with "Sent to {email}" + unsubscribe link (one-click), all translated
  - `dir="rtl"` and proper alignment when language is Arabic-style (none currently — all LTR)
- The `<title>` and `subject` line are also localized.

---

## 3. Admin notification emails to `support@sleepybabyy.com`

After a successful subscribe OR unsubscribe, send a separate internal admin email via Resend (best-effort, non-blocking).

**On subscribe** (`newsletter-subscribe/index.ts`):
After the welcome email send, also send to `support@sleepybabyy.com`:
- Subject: `🎉 New newsletter subscriber: {email}` (or `Returning subscriber` if reactivated)
- Body: simple HTML table showing email, status (new/returning), language, IP, user agent, timestamp.

**On unsubscribe** — locate the unsubscribe Edge Function. Based on the codebase, the unsubscribe page is `src/pages/Unsubscribe.tsx`. We'll check how it currently processes unsubscribes during build. If it uses an Edge Function, we add the admin email there. If it directly updates the DB, we'll add a small `newsletter-unsubscribe` Edge Function (or extend the existing one) that:
- Marks the row as `unsubscribed`
- Sends an admin alert to `support@sleepybabyy.com` with: email, language (if known), timestamp, IP, user agent
- Subject: `👋 Newsletter unsubscribe: {email}`

Both admin emails are sent with `from: "SleepyBabyy Alerts <noreply@sleepybabyy.com>"` and are wrapped in try/catch so failures never block the user-facing flow.

---

## 4. Optional: store the language

Add an optional `language` column to `newsletter_subscribers` via a migration so future sends (and the unsubscribe alert) can use the correct locale. Default `'en'`. Backfill existing rows with `'en'`.

---

## Technical summary

| File | Change |
|---|---|
| `supabase/migrations/<new>.sql` | Add `language text default 'en'` to `newsletter_subscribers` |
| `src/hooks/useNewsletterSubscription.tsx` | Pass `language: i18n.language` in invoke body |
| `supabase/functions/newsletter-subscribe/index.ts` | Accept `language`, store it, redesigned localized HTML email with logo, send admin alert to support@sleepybabyy.com |
| Unsubscribe Edge Function (existing or new) | Send admin alert to support@sleepybabyy.com on unsubscribe |

No new secrets required (RESEND_API_KEY already configured).

---

## Out of scope

- Building an in-app admin dashboard for subscribers (already discussed earlier — separate feature).
- Switching providers (continues using Resend).
