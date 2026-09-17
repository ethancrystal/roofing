# Havenridge Roofing Co. — frontend concept

A six-page, zero-dependency website concept for a residential roofing company, built to be
shown to a client. No build step, no framework, no npm install — open `index.html` and it runs.

**The brief was one line: _"makes you feel safe."_** Every decision below traces back to it.

---

## Preview

```bash
python3 -m http.server 4173
# → http://localhost:4173
```

Double-clicking `index.html` also works. It needs an internet connection the first time, because
photography and fonts are loaded from CDNs (see [Photography](#photography) below).

---

## How "feel safe" drove the design

| Decision | Why |
|---|---|
| Deep evergreen `#1E4D45` as the primary | Calm, grounded, natural shelter. Most roofers use alarm-red or corporate blue. |
| Terracotta `#C2603A` for every call to action | Warmth and clay tile — human, not urgent. |
| Warm paper `#F6F1E9` canvas, never pure white | Softer on the eye; reads domestic rather than clinical. |
| Soft radii (16–34px) and warm-tinted shadows | Nothing sharp. Shadows are tinted green-grey, never harsh black. |
| Guarantees placed above the fold and again mid-page | The anxiety is "will I get ripped off" — answer it early and twice. |
| Copy admits when you *shouldn't* hire them | "Roughly a third of our inspections end with us telling someone their roof is fine." Trust comes from turning work away. |
| Calm easing, nothing bouncy | Motion reassures instead of demanding attention. |

### Type

- **Display — Fraunces** (variable, `SOFT` axis dialled up). A soft optical serif: warm and
  established without being stuffy.
- **Body/UI — Hanken Grotesk.** Humanist, open apertures, highly legible.

Both are open-licence so the demo renders for anyone, immediately.

**Paid upgrade path.** A font recommendation run returned licensed Monotype faces that fit the
brief more precisely — **Frutiger® Next**, **Ideal Sans®**, **FS Elliot®**, **Axiforma**. They
need a licence from MyFonts/Monotype and can't ship in a free demo. Swapping one in is a
one-line change in `styles.css`:

```css
:root{ --sans:"FS Elliot", "Hanken Grotesk", system-ui, sans-serif; }
```

---

## The hero animation

A small illustrated cottage hangs above the last word of the headline, over the photograph. A
bird arcs down out of the sky, lands on its chimney, and sings. Hand-authored inline SVG + SMIL
for both — no library.

### Aiming it at your headline

The whole scene hangs from one point, held as a percentage of the hero box in `styles.css`:

```css
.hero__art{
  --scene-x:58;   --scene-y:32;   /* the top of the chimney — where the bird lands */
}
```

**These values are a tuned best guess, not a final measurement.** The designer marked an exact
spot on a screenshot that didn't reach this build, so instead they were checked against a live
render of this exact page in this environment: at that render, the word "again." sits at roughly
x 50–64% / y 38–51% of the hero box, and `--scene-x:58 / --scene-y:32` lands the house's roofline
across "have" (the end of the first line) and its walls and window across "again." (the second
line's last word), with the bird landing clear of both lines in the gap above. That was one
narrow render, not the real photo at real desktop widths — nudge the two numbers once you see it
live, the same way the old roofline's calibration numbers would have needed a check.

The house and the bird are both pinned to that single point, each in its own untransformed box,
so neither distorts if the other's sizing changes.

### How the motion is built

- **Primary** — the bird's arc down, decelerating onto the chimney.
- **Secondary** — wings flapping through the flight, a braking wingbeat, then folding; the body
  squashing on touchdown; a quick head dip on impact.
- **Ambient** — a slow breathing cycle, an occasional tail flick, a head look-around, a three-note
  song with a small glow, all looping seamlessly.

The flight plays once on load; only the quiet idle, look-around and song loops repeat, so it
never nags. Every spatial move is on a spline curve — nothing is linearly eased — and each
rotation has its pivot set before it turns. The braking wingbeat hands off into the fold at a
matching angle so there's no visual snap at the boundary.

The bird itself is a small illustration, not a flat icon: a layered wing (a base shape plus an
overlapping covert feather and a tip fleck), a soft top-to-bottom gradient on the body, and
color-blocked head, breast and tail in the site's own palette — evergreen cap, terracotta breast
and tail, gold beak, cream-to-shadow body.

The house sits behind the headline copy — it reads as sitting on the photo, not on top of the
words — while the bird sits above it, so it's never hidden by the headline wherever the chimney
lands. Both hang off `.hero__art` and `.hero__scene`, which deliberately carry no `z-index` of
their own: giving either one would seal it into its own stacking context, and the bird would be
trapped inside it, unable to render above the headline no matter what `z-index` it was given.

An earlier version of this hero was a traced roofline that ran the photographed roof's own pitch
out to both frame edges, with the bird landing on the real ridge — no drawn house, since one
boxed on the side read as a second building floating in the sky. This version deliberately
reintroduces a small drawn house, but as an overlaid vignette rather than a traced continuation
of the photo's own architecture, so it doesn't fight the photograph the same way.

Under `prefers-reduced-motion`, `main.js` jumps the SVG clock to 4.5s and pauses it — the moment
every one-shot landing animation (the squash, the wingbeat folding to rest, the head's impact
dip) has resolved to its frozen value, and also the exact moment the first ambient loop begins —
so those users see the bird already landed and settled, in a neutral pose, rather than nothing
at all or a loop caught mid-cycle.

## What's interactive

| | Where |
|---|---|
| House + bird SMIL animation | Home hero |
| Line-by-line masked headline reveal | Home hero |
| Parallax on hero and stats imagery | Home |
| Custom cursor + magnetic buttons | Desktop, fine pointers only |
| Scroll progress bar, sticky auto-hiding header, active nav state | Global |
| Service tabs with crossfading imagery | Services — full arrow-key support, vertical tablist |
| **Before/after drag comparison** | Home + Gallery — mouse, touch, hover-scrub, keyboard |
| Sticky scroll process timeline | Services — image and badge track the active step |
| Animated counters | Home stats band — ease-out, never linear |
| Filterable project grid + lightbox | Gallery |
| **Live estimate calculator** | Bookings — sliders and segmented controls |
| Testimonial carousel | About — autoplay, pauses on hover and focus |
| FAQ accordion | About |
| Inline-validating booking form | Book — real messages, success state |

### Accessibility

Semantic landmarks, skip link, visible focus rings, ARIA on the tabs and the comparison slider,
full keyboard operation, `prefers-reduced-motion` honoured throughout, and a print stylesheet
that strips the dark blocks.

Verified in headless Chromium: no console errors, and **no horizontal overflow at 390 / 900 /
1440px**.

---

## Photography

Photos are hot-linked from **Unsplash** — free to use and unwatermarked.

Shutterstock was evaluated and rejected: its preview URLs are watermarked comps, which would
look unprofessional in a client demo.

> **Note:** photography and fonts load from CDNs, so the page needs internet on first view.
> Every image sits on a warm gradient fallback, so nothing looks broken while loading. Replace
> all of it with the client's own job photos before launch — real local work outperforms stock
> for a trade business.

---

## Before this goes live

The brand, copy, numbers and imagery are **realistic placeholders**, written so the client sees
a finished site rather than a wireframe. All of it needs replacing:

- [ ] Company name, logo and brand assets — currently *Havenridge Roofing Co.*
- [ ] Phone `(604) 555-0142`, email, address, hours, licence number
- [ ] Real service list, service area and drive times
- [ ] **Verify every claim before publishing** — the 25-year workmanship warranty, "$5M liability",
      "no subcontractors", "2,400 roofs", "4.9 across 612 reviews", "answered in 2 hours".
      These are invented for the demo and are advertising claims if left in.
- [ ] Calculator rates in `main.js` (`state.material`, the `1.15` tear-off adder, the
      `0.92`/`1.13` range) — these are plausible placeholders, not the client's real pricing
- [ ] Genuine reviews with permission, and real project photos
- [ ] Point the booking form at a real endpoint — it currently only shows a success state
- [ ] Add analytics, a privacy policy, and `LocalBusiness` structured data

---

## Files

```
index.html      Home — hero + bird, guarantees, promises, services teaser,
                before/after, stats, a review, CTA
services.html   The five services in detail, plus the process timeline
gallery.html    Filterable project grid, lightbox, before/after slider
about.html      Story, team, warranty, reviews carousel, service areas, FAQ
bookings.html   What to expect, the estimate calculator, booking form
contact.html    Contact cards, message form, service areas

styles.css      Design tokens, layout, responsive, reduced-motion, print
main.js         Every interaction; each module no-ops if its markup is absent
```

The header and footer are repeated in each page rather than injected by JavaScript, so the site
still works with JS disabled and reads correctly to crawlers. If you change the nav, change it
in all six files.

Verified in headless Chromium across all six pages at 1440 / 768 / 390px: no console errors, no
unintended horizontal overflow, the mobile menu is reachable and opens, and every internal link
resolves.
