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

The roofline traces the roof of the photographed house and carries on out to both edges of the
frame, the way an architect extends a pitch. A bird then arcs down out of the sky and lands on
the real house's ridge, and sings. Hand-authored inline SVG + SMIL for the bird — no library.

### Aiming it at your photo

The line is defined by three points, held as percentages of the hero box in `styles.css`:

```css
.hero__art{
  --roof-lx:-4;   --roof-ly:74;   /* left end, running off the frame  */
  --roof-ax:44;   --roof-ay:55;   /* the apex — put this on the peak  */
  --roof-rx:104;  --roof-ry:70;   /* right end, running off the frame */
}
```

**The committed values are a starting point, not a measurement** — this repo was built in an
environment that could not load the photograph, so they have not been checked against it.

To aim them, open `index.html?roof`, drag the three handles (**L**, **A**, **R**) onto the roof
— **A** goes on the peak — and paste the values it prints back into `styles.css`. It takes about
fifteen seconds, and it's the same fifteen seconds whenever the hero photo changes.

The bird is anchored to the apex, so it follows wherever you put it.

### How the motion is built

- **Primary** — the bird's arc down, decelerating onto the ridge.
- **Secondary** — wings flapping through the flight then folding; the body squashing on
  touchdown; the ridge and its fascia line drawing on ahead of it.
- **Ambient** — a slow breathing cycle, an occasional tail flick, warm light pooling at the peak.

The flight plays once on load; only the quiet idle and the song loop, so it never nags. Every
spatial move is on a spline curve — nothing is linearly eased — and each rotation has its pivot
set before it turns.

The line sits behind the copy, on the photo where it belongs; the bird sits above it, so it is
never hidden by the headline wherever the apex lands.

An earlier version drew a complete little house — walls, chimney — boxed on the right-hand side.
Over a photograph of an actual house that read as a second building floating in the sky, and the
clipped edge looked accidental rather than deliberate.

Under `prefers-reduced-motion` the ridge is drawn immediately and `main.js` jumps the SVG clock
to 6.2s and pauses it, so those users see the bird already perched rather than nothing at all.

## What's interactive

| | Where |
|---|---|
| Roof + bird SMIL animation | Home hero |
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
