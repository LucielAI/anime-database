# Site Audit Report — 2026-03-27
**Branch:** fix/site-audit-2026-03-27
**Status:** In progress — fixing all items before PR review

---

## 🔴 CRITICAL (Revenue/Trust)

### C1: Newsletter subscriber count is fake + broken
- **File:** `src/App.jsx` (NewsletterCTAHero)
- **Bug:** `subscriberCount` initialized from localStorage via `useState(() => ...)`. After successful form submit, localStorage is updated but `subscriberCount` state does NOT re-render — it's locked at initial value.
- **Fake number:** "2,847 subscribers" is hardcoded fallback with no live data source.
- **Fix:** Derive count directly in render from localStorage, or use a ref that updates on submit.
- **Next step:** Wire Supabase to store/retrieve real count.

### C2: TikTok CTAs everywhere — stealing retention
- **Files:** `src/components/CommunityPulse.jsx`, universe catalog CTA
- **Problem:** "Can't find it? Request it on TikTok" sends users OFF platform. This is the opposite of retention.
- **Fix:** Replace TikTok request CTA with on-site Supabase form submission (archive_suggestions table already exists). Keep TikTok as ONE link, not the primary channel.

### C3: "Contact" footer links to TikTok DMs
- **File:** `src/App.jsx` footer
- **Problem:** Not a real contact mechanism. Looks broken.
- **Fix:** Remove "Contact" link, or replace with mailto: link.

---

## 🟠 HIGH (SEO / Indexing / Visibility)

### H1: Meta description too generic
- **File:** `src/utils/seo.js` → `buildHomeSeo`
- **Current:** "Explore anime power systems, anime analysis, and anime comparison in one archive"
- **Problem:** No unique value proposition. Every anime site says something like this.
- **Fix:** Write a punchy 155-char description with the actual differentiator: structured system analysis, not plot summaries.

### H2: Universe page OG descriptions are thin
- **File:** `src/utils/seo.js` → `buildUniverseSeo`
- **Current:** "Explore the system architecture of {anime}." (generic for all 30 universes)
- **Problem:** Every universe page has the same 8-word description. Terrible for social sharing and AI citations.
- **Fix:** Use the universe's tagline or a snippet from the system analysis as the description.

### H3: No Article schema on blog posts
- **File:** `src/components/BlogPost.jsx`
- **Problem:** Blog posts lack `@type: Article` JSON-LD structured data.
- **Fix:** Add Article schema with headline, datePublished, author, description.

### H4: No FAQ schema on universe pages
- **File:** `src/components/PowerSystemPage.jsx` (inside UniverseRoute)
- **Problem:** Universe pages have no FAQ schema, missing rich snippet opportunity in search + AI citation context.
- **Fix:** Add FAQPage schema from the universe's `systemQuestions`.

### H5: Dynamic OG image = cold start latency
- **File:** `api/og.js`
- **Problem:** `/api/og` is a Vercel serverless function. Cold starts = slow LCP. No CDN cache.
- **Fix:** Add `Cache-Control: public, max-age=31536000, immutable` header to OG image responses. Static OG fallbacks should be hardcoded per universe.

### H6: Sitemap hardcoded base URL
- **File:** `scripts/generateSitemap.js`, `api/sitemap.xml.js`
- **Problem:** `https://animearchive.app` hardcoded — won't work on preview deploys.
- **Fix:** Use `import.meta.env.SITE_URL || 'https://animearchive.app'` as base.

---

## 🟡 MEDIUM (UX / Brand / Retention)

### M1: Homepage overview paragraph is weak
- **File:** `src/App.jsx` inside `<main id="main-content">`
- **Current:** "Anime Architecture Archive helps you compare how different shows handle power, fights, and world rules."
- **Problem:** Generic. No hook. Doesn't tell visitors WHY they should stay.
- **Fix:** Write something punchy that connects to the hero's emotional promise.

### M2: "Created by Hashi.Ai" — weak brand signal
- **File:** `src/App.jsx` footer
- **Problem:** Sounds like a hobby project, not an authoritative source.
- **Fix:** "Built by the Anime Architecture Archive" or just remove the line.

### M3: Instagram icon in footer — dead link
- **File:** `src/App.jsx` footer
- **Problem:** No Instagram presence. Decorative broken link.
- **Fix:** Remove Instagram icon entirely, or add if/when there's an account.

### M4: Newsletter "2,847 subscribers" claim unverifiable
- **File:** `src/App.jsx` (NewsletterCTAHero)
- **Problem:** If there's no live count, this number looks fake.
- **Fix:** Either remove the count, or make it conditional (only show if > 100).

### M5: `decoding="async"` missing on LCP images
- **Files:** Hero image, featured universe cards, SpotlightCarousel
- **Problem:** Images block decoding, hurting LCP.
- **Fix:** Add `decoding="async"` to all below-fold images. Add `fetchpriority="high"` + `loading="eager"` to hero/carousel images.

### M6: Blog post limit — only 3 posts
- **File:** `public/blog-index.json`
- **Problem:** 7 stub posts removed, leaving only 3 real posts. Looks abandoned.
- **Fix:** The 3 posts with content are good. But the site needs more content to look active. This is a CONTENT TASK, not a code fix. Need to publish more blog posts.

### M7: Newsletter success message lacks share hook
- **File:** `src/App.jsx` (NewsletterCTAHero)
- **Current:** "You're in. Next drop is yours to know first."
- **Retention opportunity:** Could include a Twitter/TikTok share prompt to drive referral traffic.
- **Fix:** Add small "Spread the word" line with share prompt on success state.

---

## 🟢 LOW (Polish / Performance)

### L1: `rerender-derived-state-no-effect` anti-pattern in NewsletterCTAHero
- Already covered in C1.

### L2: `fetchpriority` not set on hero carousel image
- The carousel image changes on interval — the initially visible image should be `fetchpriority="high"`.
- **Fix:** Add `fetchpriority="high"` to the current slide image.

### L3: Sticky search bar z-index overlap
- **File:** `src/App.jsx` sticky search bar
- **Problem:** `z-50` may overlap with GlobalSearch modal overlay.
- **Fix:** Ensure `GlobalSearch` modal has `z-[100]` or higher.

### L4: CommunityPulse TikTok link tracking
- External link to TikTok should have `rel="noopener noreferrer"`.
- **Fix:** Already present in footer. Check CommunityPulse too.

### L5: Font preload not confirmed
- Check if Google Fonts (if any) are preloaded with `font-display: swap`.
- **Fix:** Verify in `index.html`.

### L6: OG image fallback in vercel.json
- After PR #147, `public/og-fallback.png` serves as static fallback when OG API fails.
- This is good — but we should confirm it's sized correctly for Twitter (1200x630).

---

## 📋 RETENTION ANALYSIS

### What's working (keep):
- Returning visitor "Continue" banner — excellent retention mechanic
- Compare → system link in hero — clear next action
- Newsletter CTA strip after carousel — good placement
- CommunityPulse voting — engagement mechanic
- Keyboard shortcuts overlay — power user feature
- "Where to Go Next" section — reduces dead ends

### What's hurting retention:
- TikTok CTAs everywhere → users leave instead of engaging on-site
- Generic meta description → poor search appearance → high bounce
- No on-site request mechanism → frustrated users have nowhere to go
- 3 blog posts → looks dead → no reason to return
- Newsletter count unverifiable → trust issue

### Retention opportunities:
1. On-site universe request form (Supabase suggestion table already exists)
2. "Share your comparison" CTA after compare → drives organic
3. "Notify me when {universe} drops" per universe page
4. Better internal linking between related universes
5. Return visitor专属 content (continue reading, saved comparisons)

---

## ✅ Already Fixed in Current Branch

- /blog 404 → vercel.json blog(?!\b) fix
- Search button ReferenceError → onSearchOpen prop passed App→Home
- Homepage blog 3→6 posts
- Carousel card tappable → navigate to universe
- Carousel mobile arrows 48px→36px
- About page visual polish
- System cards → /systems/{key} thematic pages
- 7 zero-content blog stubs removed from index
- React.memo on SpotlightCarousel
- Carousel gradient brightness reduced (96%→80%)
- Static OG fallback confirmed in vercel.json

---

## 🚫 Not doing (out of scope for this pass)

- Full blog content creation (content task)
- New universe data collection (content task)
- Multi-language / i18n (not yet needed)
- AMP pages (not relevant for this audience)
- Push notifications (too early)
- User accounts / saved states (complex, needs auth)
- Mobile native app (outside scope)
