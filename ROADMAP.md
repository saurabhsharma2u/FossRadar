# FossRadar Roadmap

> Making FossRadar the definitive place to discover, evaluate, and migrate to FOSS alternatives.

---

## Current State

- 94 OSS projects tracked
- Periodic sync of stars, forks, last updated, and metadata
- Filter by category, language, sort by stars / recent / growth
- Individual project pages
- Astro + Cloudflare Workers stack

---

## Phase 1 — Foundation (Make it findable)

> Goal: Dramatically increase organic discovery and answer the question users actually arrive with.

### "Replaces X" tagging
- [x] Add `replaces: [Notion, Confluence]` metadata to every tracked project
- [x] Homepage search flow: "What does X replace?" as a primary entry point
- [x] Each project page lists the proprietary tools it replaces
- [x] Reverse index: "Alternatives to Notion" pages with full SEO slugs

### Full-text search
- [x] Search across name, description, tags, and replaces fields
- [x] Fuzzy match support
- [x] Keyboard shortcut accessible (`/` to focus)

### Health score
- [x] Composite signal beyond raw stars: commit frequency + release cadence + issue response time + contributor count trend
- [x] Displayed as a simple health badge (Active / Slowing / At Risk / Archived)
- [x] Replaces the current binary Active/Archived label with nuance

### Fix the version stamp
- [x] Show latest release version + date, not just "last commit"
- [x] Flag the gap when last commit >> last release (signals unmaintained release line)

---

## Phase 2 — Differentiation (What no other directory does)

> Goal: Introduce signals that make FossRadar genuinely more useful than awesome-lists or alternativeto.net.

### Star history sparklines
- [x] Inline 90-day trajectory chart on each card
- [x] Surfaces rising projects before they blow up
- [x] A project at 5k trending up is more interesting than 50k flatlined

### Fork tracker
- When a project goes quiet, surface the most actively maintained fork automatically
- Critical for the FOSS ecosystem where forks are the continuity mechanism
- Example: `flutter_pulltorefresh` → `smart_refresher`

### Bus factor indicator
- Contributor concentration: what % of commits come from 1 person?
- Flag single-maintainer projects clearly — one burnout away from abandonment

### Self-hostable badge
- [x] Explicit flag: fully self-hostable / cloud-only / hybrid
- [x] One of the first filters FOSS-minded users apply, currently absent

### License clarity filter
- [x] Surface license type prominently: MIT / Apache / AGPL / GPL / BSL
- [x] "Commercial-safe" quick filter (MIT + Apache only)
- Flag recent license changes (BSL risk, HashiCorp-style moves)

### Funding / sustainability indicator
- [x] Show if project has OpenCollective, GitHub Sponsors, or commercial backer
- [x] Solo-dev MIT project vs VC-backed carries very different longevity risk

---

## Phase 3 — Discovery Engine (The actual radar)

> Goal: Surface the right project at the right moment, including things users didn't know to look for.

### "Rising under the radar"
- [x] Projects under 1k stars with accelerating commit velocity and growing contributor count
- [x] Weekly refreshed, shown on homepage
- [x] This is the actual radar metaphor realised

### "Recently went FOSS" feed
- Track companies open-sourcing previously proprietary tools
- Also track the reverse: license downgrades / enshittification events
- High press pickup potential

### Dead SaaS tracker
- Monitor HN, Reddit, and tech news for "X is shutting down / raising prices / getting acquired"
- Proactively surface FOSS alternatives when a SaaS makes the news
- Be the first place people land in migration moments

### Category gap map
- Visual showing which SaaS categories have strong FOSS alternatives and which are underserved
- Useful for builders, shareable as a standalone piece of content

### Abandonment alerts
- Proactively notify (RSS / email) when a tracked project goes quiet: no commits in 90 days, repo archived, maintainer inactive
- Most directories show stale data silently — warning people is a differentiator

---

## Phase 4 — Trust & Verification

> Goal: Make FossRadar the source teams trust for evaluating production readiness.

### Security audit badge
- [x] Surface if a project has had a third-party security audit (many serious projects publish these)
- [x] Link directly to the published report

### CVE history
- Pull from OSV / GitHub advisories
- Show count of CVEs + resolution speed — transparency, not just a red flag

### "Enterprise ready" checklist
- [x] SSO support, audit logs, SLA availability, professional support options
- [x] A lot of FOSS adoption is blocked at enterprise procurement for exactly these reasons

### Enshittification risk flag
- CLA requirements, corporate ownership, recent license change history
- Lightweight signal for teams that have been burned by HashiCorp / Elasticsearch moves

---

## Phase 5 — Community & Retention

> Goal: Give users a reason to come back and contribute beyond one-time lookups.

### "I use this" counter
- No auth required, cookie-based
- Usage signal separate from GitHub stars
- A library can have 50k stars but 3 actual production users

### Weekly digest
- RSS + optional email
- New additions, biggest movers, abandonment alerts, recently went FOSS
- Drives repeat visits without requiring an account

### Comparison mode
- Select 2–3 projects, see them side by side on all key signals
- Most useful for crowded categories (Notion alternatives, Firebase alternatives)

### Maintainer verified profiles
- Let project maintainers claim their listing
- Add context, link to sponsor page, post announcements
- Creates a relationship with the maintainer community

### Shareable collections
- "My self-hosting stack" — curated lists that can be linked
- Gives power users a reason to invest time in the site

### Community submission queue
- GitHub issues work but have friction
- Simple upvote queue for suggested projects, periodically reviewed
- Scales contribution without creating noise

---

## Phase 6 — Content & SEO

> Goal: Make FossRadar the destination people cite and link to.

### Migration guides
- "Switching from Notion to AppFlowy: what you lose, what you gain"
- Community contributed, high search intent, high shareability

### Changelog digests
- Weekly summary of significant releases across all tracked projects
- Becomes the one place to follow FOSS without monitoring 94 GitHub repos

### "State of FOSS" annual report
- Fastest growing, most abandoned, most forked, categories with most momentum
- Would get picked up by newsletters every year

### Platform support matrix
- [x] Linux / macOS / Windows / Mobile / Web / Docker per project
- [x] Critical for self-hosters, currently absent everywhere

---

## Moonshot — The Defining Feature

### Proprietary → FOSS migration cost estimator
- Input: current SaaS stack + team size + usage tier
- Output: estimated self-hosting cost (compute, maintenance hours, setup time) vs. current subscription spend
- Even a rough calculator would be uniquely valuable
- High viral potential in r/selfhosted, HN, and enterprise procurement conversations
- Nothing like this exists anywhere

---

## Not doing (deliberately)

- **User accounts / auth** — adds complexity, the core value is browsable without friction
- **Paid tiers** — FossRadar should be free and open, monetise only if needed via sponsorship
- **Automated project ingestion without curation** — volume without quality destroys trust

---

## Stack notes

Current: Astro + Cloudflare Workers + GitHub Actions for data sync

Phases 1–2 require: metadata schema extension, search index (Pagefind or Fuse.js fits the static stack well)

Phases 3–4 require: scheduled data pipeline extension, possibly a lightweight DB for historical sparkline data (D1 fits the Cloudflare stack)

Phase 5+ may require: minimal auth layer if personalization (collections, digest subscriptions) is built

---

*Last updated: March 2026*
