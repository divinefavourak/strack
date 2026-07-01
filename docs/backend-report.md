# Strack API — Backend Issues Report

**From:** Mobile (Expo / React Native) client
**API base:** `https://strack-api-zyaa.onrender.com/api/v1`
**Auth:** `Authorization: Bearer <access_token>` (from `/auth/login` / `/auth/register`), refresh via `/auth/refresh`
**Date:** 2026-06-30

## Summary

| # | Area | Symptom | Suspected layer |
|---|------|---------|-----------------|
| 1 | Leaderboard | `GET /leaderboard` returns only the requesting user | Backend scoping/seeding |
| 2 | Community feed | `GET /feed/community` returns nothing from other users | Backend scoping/population |
| 3 | Friends | `POST /friends/requests` → "no user found with that email" for real emails; suggestions can't be added | Backend lookup + schema gap |
| 4 | Steps | Need confirmation that `POST /steps/sync` updates today's totals/streak | Verification |

All four are **single-user-environment** symptoms — the client calls each endpoint correctly, but there is no second user / social data for the API to return. The sections below ask the backend to confirm intended scoping and to provide seed data for testing.

---

## Issue 1 — Leaderboard shows only the current user

- **Endpoint:** `GET /api/v1/leaderboard?scope=today` (also `week`, `month`)
- **Client behavior:** renders `response.entries[]`, and `response.my_rank` for the "You are #N" banner.
- **Observed:** `entries` contains only the authenticated user.
- **Questions for backend:**
  1. Is the leaderboard intended to be **global/public** or **friends-only**? The mobile UI presents it as a general leaderboard.
  2. Does the `leaderboard_visibility` setting (`public | friends | anonymous`) filter who appears? What is the **default** for a new user, and does a user need `public` to be *included* in others' boards?
  3. Are users with **0 steps** in the scope excluded? If so, on a fresh DB only the active user appears — expected, but please confirm.
  4. Confirm ranking is computed across the correct user set per `scope`.

---

## Issue 2 — Community feed returns no posts from others

- **Endpoint:** `GET /api/v1/feed/community?limit=20` (and `GET /api/v1/feed/activity`)
- **Client behavior:** renders `FeedPostRead[]` (`type`, `payload`, `display_name`, `avatar_url`, `created_at`, `reactions`). "Activity" tab = the user's own; "Community" tab = expected to show others.
- **Observed:** Community feed is empty (no posts from other people).
- **Questions for backend:**
  1. Is `/feed/community` **global** (all users' community shares) or **friends-only**?
  2. Are `community_share` posts created **only** via `POST /feed/share`, or are `activity_summary` / `milestone` posts **auto-generated** by the system (e.g., on goal completion, streak, milestones)? If auto-generated, what triggers them?
  3. Confirm the **shape of `payload`** per `type` — the client currently reads `payload.message / title / body / summary`. A documented schema per `type` would prevent guesswork.
  4. Does `POST /feed/{post_id}/react` increment the `reactions` map returned by the feed endpoints?

---

## Issue 3 — Friend requests fail + suggestions can't be added

- **Endpoints:** `POST /api/v1/friends/requests` body `{ "username_or_email": "<value>" }`; `GET /api/v1/friends/suggestions`
- **Client behavior:** the search box sends exactly what the user types as `username_or_email`. The "Add" button on a **suggestion** sends the suggestion's `display_name` (see schema gap below).
- **Observed:** "No user found with that email" even for emails believed to be valid.
- **Questions / requests for backend:**
  1. Confirm the lookup for `username_or_email`: does it match **both** username and email? Is it **case-insensitive** and **trimmed**? (Common cause of false "not found.")
  2. **Schema gap:** `GET /friends/suggestions` returns `{ user_id, display_name, avatar_url }` — **no username or email**. So the client has no valid identifier to pass to `POST /friends/requests` for a suggested user. **Please either:**
     - (a) allow `POST /friends/requests` to accept a `user_id`, **or**
     - (b) include `username` (or email) in `FriendSuggestion`.
  3. Confirm the error response shape for a missing user (currently surfaced from `detail`) and the success response (`FriendRequestRead`).
  4. Does `GET /friends/requests` (incoming, `status=pending`) include the **requester's `display_name` / `avatar_url`**? The UI needs them to render the request; the documented schema only has IDs + status.

---

## Issue 4 — Please confirm step-sync side effects

- **Endpoints:** `POST /api/v1/steps/sync` (body `{ events: [{ client_event_id, steps_delta, recorded_at }] }`), `GET /api/v1/steps/today`, `GET /api/v1/steps/history?range=week`
- **Client behavior:** the device pedometer batches deltas with a stable `client_event_id` and POSTs them; the UI reads `GET /steps/today` for the ring/stats.
- **Please confirm:**
  1. `POST /steps/sync` is **idempotent** on `client_event_id` (retries/duplicates don't double-count).
  2. After sync, `GET /steps/today` reflects updated `total_steps`, `distance_km`, `calories`, `steps_remaining`, `current_streak`, and `goal_completed_at`.
  3. `progress_percent` — does it **cap at 100**? (The client now derives ring progress from `total_steps / goal_steps` so it can render an over-goal overflow; just confirming the field's range.)
  4. Do step updates feed into the **leaderboard** and trigger any **milestone / activity feed** entries?

---

## Cross-cutting / environment notes

- **Render free tier cold starts:** the first request after idle can take ~30s; the client uses a 30s timeout. If this is sustained, consider a warm-up ping or a paid tier.
- **Error bodies:** read from `{ "detail": ... }` (string or validation array) — please keep that consistent.
- **Auth:** confirm `/auth/refresh` returns a new `access_token` + `refresh_token`, and the access-token TTL (the client does single-flight refresh on `401`).

## To unblock end-to-end testing (request)

The social features cannot be validated with one account. Please provide **either**:

- a few **seed users** with recent step activity and `public` leaderboard visibility, plus a couple of **community posts**, **or**
- confirmation of the intended scoping, so we can validate by creating a second real account and friending it.
