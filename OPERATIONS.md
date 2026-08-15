# FileYourRIA.com — Full Operational Reference

This document covers every system involved in running fileyourria.com and its associated Facebook ad campaign. Anyone reading this should be able to take over full operational control with no outside knowledge assumed.

---

## 1. What This Is

**FileYourRIA.com** is an independent RIA registration consulting business. It is a market study / lead generation operation with zero Dversify branding. The site captures qualified leads (financial advisors who want to register their own RIA), emails them a checklist, and books free 30-minute consultations.

---

## 2. Domain

| Field | Value |
|---|---|
| Domain | `fileyourria.com` |
| Registrar | Cloudflare Registrar (managed inside Cloudflare dashboard) |
| DNS | Cloudflare (authoritative — nameservers are NS1/NS2.cloudflare.com) |
| SSL | Cloudflare automatic (Full strict) |

**DNS records of note:**

| Type | Name | Value | Purpose |
|---|---|---|---|
| CNAME/Worker route | `fileyourria.com` | Cloudflare Worker (fyria) | Serves the entire site |
| TXT | `send._domainkey.fileyourria.com` | Resend DKIM key | Email deliverability |
| TXT | `fileyourria.com` | `v=spf1 include:amazonses.com ~all` | SPF for Resend |
| MX | `fileyourria.com` | Resend MX records | Inbound/reply routing |

To view or edit DNS: **dash.cloudflare.com → fileyourria.com → DNS**.

---

## 3. Website Hosting — Cloudflare Worker

The entire website (both pages) runs as a single **Cloudflare Worker** named `fyria`. There is no server, no hosting bill, no CDN to configure separately. Cloudflare's edge runs the JavaScript on every request globally.

### Worker details

| Field | Value |
|---|---|
| Worker name | `fyria` |
| Cloudflare account | Account ID `ddd4f5d55750972b679c918316b22fe5` |
| Worker dashboard | dash.cloudflare.com → Workers & Pages → fyria |
| Entry point | `src/index.js` |
| Compatibility date | 2024-09-23 |

### Routes served

| Path | What it returns |
|---|---|
| `GET /` | Full landing page (pricing, FAQ, Cal.com booking embed) |
| `GET /qualify` | 6-step lead qualification form (FB ad destination) |
| `POST /api/submit` | JSON endpoint — scores lead, sends two emails, returns redirect URL |
| Anything else | 404 |

### Secret environment variable

The worker needs one secret that is NOT in the repo:

| Secret name | Value | Where to set |
|---|---|---|
| `RESEND_API_KEY` | *(redacted — see Resend dashboard → API Keys)* | Cloudflare dashboard → Workers → fyria → Settings → Variables → Secrets |

**Never commit this key to git.**

---

## 4. Code Repository

| Field | Value |
|---|---|
| GitHub repo | `https://github.com/kbhanush/fileyourria` |
| Local clone (primary) | `~/Projects/fileyourria` |
| Branch | `main` |
| Deploy mechanism | **Automatic** — Cloudflare is connected to this GitHub repo via a Pages/Workers Git integration. Any push to `main` triggers a new deploy. There is no manual deploy step. |

### How to make a change and deploy

```bash
cd ~/Projects/fileyourria
# edit src/index.js
git add src/index.js
git commit -m "your change description"
git push origin main
# Cloudflare deploys automatically within ~30 seconds
```

To verify the deploy fired: dash.cloudflare.com → Workers & Pages → fyria → Deployments.

### Repository structure

```
fileyourria/
├── src/
│   └── index.js        # entire site — landing page, qualify form, submit handler
├── wrangler.toml        # Cloudflare Worker config (name, account_id, entry point)
├── README.md
└── OPERATIONS.md        # this file
```

All HTML for both pages lives as template literals inside `src/index.js`. There are no separate HTML files, no build step, no bundler.

---

## 5. Email — Resend

All transactional email is sent through **Resend** (resend.com).

| Field | Value |
|---|---|
| Account | Login at resend.com — use the krisb99@gmail.com Google account |
| Sending domain | `fileyourria.com` (verified) |
| From address | `hello@fileyourria.com` |
| API key | stored as Cloudflare Worker secret `RESEND_API_KEY` — retrieve from Cloudflare dashboard or Resend.com |

### Emails sent on each form submission

**Email 1 — Lead notification** (to `hello@fileyourria.com`):
- Subject: `[HIGH/MEDIUM/LOW] New RIA Lead: {name}`
- Contains: lead score, action recommendation, contact details (name, email, phone), all 6 form answers
- Color-coded: GREEN = HIGH (book immediately), YELLOW = MEDIUM (follow up 48h), GRAY = LOW (nurture only)

**Email 2 — Checklist** (to the lead's email address):
- Subject: `Your RIA Registration Checklist — FileYourRIA.com`
- Contains: 8-phase personalized RIA registration checklist
- Varies slightly by score: HIGH/MEDIUM get a CTA to book a call; LOW gets an email-us note

### Lead scoring logic

| Criteria | Score |
|---|---|
| Licensed (Series 65 or CFP/CFA/etc.) AND timeline is ASAP or 30 days | **HIGH** → auto-redirect to Cal.com booking |
| Licensed AND timeline is 1–3 months | **MEDIUM** → shows booking CTA |
| Not licensed yet OR just researching | **LOW** → no booking push |

---

## 6. Booking — Cal.com

Free consultations are booked through **Cal.com**.

| Field | Value |
|---|---|
| Cal.com account | `fileyourria` — login at cal.com |
| Event type | "30 min RIA consulting call" |
| Booking URL | `https://cal.com/fileyourria/30min` |
| Location | Set to phone/text in Cal.com event settings (Google Meet link sent via text) |
| Calendar connected | Your personal Google calendar (or whatever is connected in Cal.com settings) |

**Prefill behavior:** When a HIGH or MEDIUM lead submits the qualify form, they are redirected to Cal.com with their name, email, and phone pre-populated in the URL:
```
https://cal.com/fileyourria/30min?name=Jane+Smith&email=jane@example.com&phone=5551234567
```
They do not have to re-enter contact details.

**Landing page embed:** The landing page (`/`) also embeds the Cal.com calendar inline using the Cal.com embed script, so visitors can book directly from the homepage without going to cal.com.

---

## 7. Meta Pixel & Conversion Tracking

| Field | Value |
|---|---|
| Meta Pixel ID | `1038950925386700` |
| Pixel name | FileYourRIA-Pixel |
| Where it fires | Every page load on `/` and `/qualify` (`PageView` event) |
| Conversion event | `Lead` — fires in JavaScript immediately after a successful form submission |

The Pixel is injected directly into the `<head>` of both HTML pages in `src/index.js`. No tag manager is involved.

To view pixel data: Meta Events Manager → Datasets → select FileYourRIA-Pixel (ID 1038950925386700).

---

## 8. Facebook Ad Campaign

### Ad account

| Field | Value |
|---|---|
| Business Manager | Dversify (same BM as Dversify ads) |
| Ad Account ID | `905530168646375` |
| Ad Account URL | https://www.facebook.com/adsmanager/ (select this account) |

### Facebook Page

| Field | Value |
|---|---|
| Page name | File Your RIA |
| Page URL | https://www.facebook.com/profile.php?id=61593348026495 |
| Page ID | `61593348026495` |

Assets uploaded to the page:
- Profile picture: `fileyourria-profile.svg` (800×800, navy background, gold "RIA" mark) — in `~/Downloads/`
- Cover photo: `fileyourria-cover.svg` (1640×624, navy gradient, FileYourRIA wordmark) — in `~/Downloads/`

### Campaign structure

```
Campaign: [FileYourRIA — RIA Setup Leads]  ← Leads objective, Special Ad Category: Financial Products
  └── Ad Set: [RIA Setup — Financial Advisors]
        ├── Conversion: Website → Lead event → FileYourRIA-Pixel
        ├── Budget: $25/day
        ├── Audience: 1.9M–2.2M (job titles + professional interests, no age/gender restriction per Special Ad Category rules)
        │     Job titles: Financial Adviser, Financial Planner, Personal Financial Advisor,
        │                 Wealth Management Advisor, Life Insurance Advisor
        │     Interests: Certified Financial Planner, CFA Institute (education), Entrepreneurship (AND layer)
        └── Ad: FileYourRIA Carousel Ad  ← PAUSED — enable when ready to go live
              Format: Carousel, 5 slides
              Destination: https://fileyourria.com/qualify
              CTA: Learn More
```

### Carousel ad slides

All 5 slides are in `~/Downloads/`:

| File | Headline | Description |
|---|---|---|
| `fyria_slide1.png` | Your RIA. Your Business. Our Expertise. | Flat-fee pricing. Start to approval. |
| `fyria_slide2.png` | From Entity Formation to State Approval | Form ADV, IARD setup, state filing — done for you. |
| `fyria_slide3.png` | Option 1 — DIY With Expert Support · $999 | You file. We guide, review, and coach you through. |
| `fyria_slide4.png` | Option 2 — White-Glove Service · $1,999 | We prepare every document and stay with you to approval. |
| `fyria_slide5.png` | Free 30-Min Consultation — No Obligation | We'll map your registration path — no obligation. |

Slides were generated using Gemini 2.5 Flash Image via Vertex AI (project: `dversify-test`). Generation script: `~/Projects/dversify2/` scratchpad — see `gen_carousel.py`.

### Ad copy (primary text)

```
Thinking about launching your own RIA?

We help financial advisors set up their RIA — from entity formation to
state approval. Flat-fee pricing, expert guidance, start to finish.

Free consultation. No commitment.
```

### Special Ad Category notes

This campaign runs under **Financial Products and Services** special ad category. This means:
- Age targeting is restricted (cannot target by age range)
- Gender targeting is restricted
- Some detailed interest targeting may be limited
- These restrictions are enforced by Meta automatically — do not attempt to circumvent

---

## 9. User Flow End to End

```
FB Ad (carousel) → Learn More CTA
  ↓
fileyourria.com/qualify  [Meta Pixel: PageView]
  ↓
6-step form:
  Step 1: Credentials (Series 65 / designation / studying / not licensed)
  Step 2: Situation (wirehouse / independent / fresh / adding) [licensed path only]
  Step 3: Entity (formed / knows type / needs help) [licensed path only]
  Step 4: States (single / multi / SEC / not sure) [licensed path only]
  Step 5: Timeline (ASAP / 30 days / 1–3 months / researching)
  Step 6: Contact — Name*, Email*, Phone* (required; phone used for meeting link)
  ↓
POST /api/submit  [Meta Pixel: Lead event fires]
  ↓
Lead scored HIGH/MEDIUM/LOW
  ↓
Resend sends two emails simultaneously:
  → Notification to hello@fileyourria.com (score + all answers + contact)
  → Checklist to lead's email (personalized 8-phase RIA registration guide)
  ↓
HIGH/MEDIUM: Auto-redirect to cal.com/fileyourria/30min?name=...&email=...&phone=...
             (fields pre-populated — lead books without re-entering details)
LOW: Thank-you screen with link back to fileyourria.com
```

---

## 10. How to Take Operational Actions

### Update site content
Edit `~/Projects/fileyourria/src/index.js`, commit, push to `main`. Live in ~30 seconds.

### Change pricing or service tiers
Search `src/index.js` for `$999` or `$1,999`. All pricing copy is in the `LANDING_HTML` and `QUALIFY_HTML` template literals.

### Change the Cal.com event
Log into cal.com → Event Types → edit "30 min RIA consulting call". You can change duration, availability, location type, and form fields there.

### View leads received
Check `hello@fileyourria.com` inbox. Every submission sends a color-coded notification email. Alternatively, check Resend dashboard (resend.com) → Emails for delivery logs.

### Pause or enable the Facebook ad
Ads Manager → select ad account 905530168646375 → Ads tab → toggle the FileYourRIA Carousel Ad on/off.

### Change ad budget
Ads Manager → Ad Sets tab → edit "RIA Setup — Financial Advisors" → Daily Budget.

### Rotate ad creative
Upload new images directly in Ads Manager → Ads → edit the carousel ad → swap individual cards.

### Check pixel is firing
Meta Events Manager → Datasets → FileYourRIA-Pixel (1038950925386700) → Test Events tab → browse to fileyourria.com/qualify in the test browser.

### Deploy a code change
```bash
cd ~/Projects/fileyourria
git add -p          # review changes
git commit -m "..."
git push origin main
```

### Emergency — revert last deploy
```bash
cd ~/Projects/fileyourria
git revert HEAD
git push origin main
```

### Rotate the Resend API key
1. Generate new key at resend.com → API Keys
2. Cloudflare dashboard → Workers → fyria → Settings → Variables → update `RESEND_API_KEY`
3. Delete old key in Resend

---

## 11. Accounts & Access Summary

| Service | Login | Notes |
|---|---|---|
| Cloudflare (domain + worker) | cloudflare.com — krisb99@gmail.com Google SSO | Domain registrar + DNS + Worker hosting |
| GitHub | github.com/kbhanush | Repo: kbhanush/fileyourria — push to main deploys |
| Resend | resend.com — krisb99@gmail.com | Transactional email; domain fileyourria.com verified |
| Cal.com | cal.com/fileyourria | Booking page; connect your calendar here |
| Meta Ads Manager | business.facebook.com — krisb99@gmail.com | Ad account 905530168646375 under Dversify BM |
| Meta Events Manager | Same Meta login | Pixel 1038950925386700 |

---

## 12. What Does NOT Exist (intentional)

- **No database** — lead data lives in notification emails only. If you want a CRM, pipe the notification email into HubSpot, Airtable, or similar.
- **No payment processing** — consultations are booked free; payment is handled offline after the call.
- **No backend server** — everything is edge-compute (Cloudflare Worker). There is no VM, no container, no Node.js process to keep running.
- **No staging environment** — the only live URL is fileyourria.com. Test changes locally with `wrangler dev` before pushing.

### Local development

```bash
cd ~/Projects/fileyourria
npx wrangler dev        # runs worker locally at http://localhost:8787
                        # RESEND_API_KEY won't be set locally — email calls will fail
                        # use .dev.vars file with RESEND_API_KEY=... for local email testing
```
