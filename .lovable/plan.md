## Problem

When subscribing to the newsletter, the user sees "Subscription Failed — Edge Function returned a non-2xx status code".

**Root cause** (verified from logs + database):
1. The email `jhonejitx@gmail.com` is already in the `newsletter_subscribers` table with status `active`.
2. The edge function correctly returns HTTP 400 with `{ error: "You are already subscribed..." }`.
3. However, `supabase.functions.invoke()` treats any non-2xx as a generic error — `error.message` becomes `"Edge Function returned a non-2xx status code"` and never contains the words "already subscribed". So the frontend's friendly-handling branch is never reached and the user sees the raw error toast.
4. Additionally, the welcome email design is plain and not on par with global SaaS standards.

## Fix

### 1. Edge function (`supabase/functions/newsletter-subscribe/index.ts`)
- For the "already subscribed" case, return **HTTP 200** with `{ success: true, alreadySubscribed: true, message: "You're already on our list!" }` instead of a 400 error. This is the standard pattern used by Mailchimp/Substack/ConvertKit — re-subscribing is never an error from the user's perspective.
- Keep 400 only for true validation failures (invalid email format).
- Redesign the welcome email HTML to match a modern global SaaS look: hero header with brand gradient, clean typography, feature highlights with icons, primary CTA button, social/footer block. Use SleepyBabyy brand (blue gradient, sleepybabyy.com).

### 2. Frontend hook (`src/hooks/useNewsletterSubscription.tsx`)
- Handle the new `alreadySubscribed: true` response with a friendly toast ("You're already subscribed 📧").
- Improve fallback handling so any non-2xx still shows a clear, friendly message instead of the raw "non-2xx" string.

### 3. No database changes required
The `newsletter_subscribers` table already exists with the correct schema.

## Result
- Re-subscribing shows a friendly "Already subscribed" toast (no error).
- New subscribers receive a polished, branded welcome email matching modern SaaS standards.
- Genuine failures still show clear error messages.
