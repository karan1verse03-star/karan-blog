# Visual Effects Reference

> Modern CSS effect principles and techniques — context-appropriate, never decorative for its own sake.
> **Every effect must serve a purpose. Understand the pattern, customize the values.**

---

## 1. Glassmorphism

> ⚠️ **Standard blue/white glassmorphism is a modern cliché.** Use it only when it genuinely serves the design — or subvert it with unexpected colors.

**Works on:** colorful/image backgrounds, modals, navbars over scrolling content.
**Avoid on:** text-heavy content, simple solid backgrounds, performance-constrained devices.

```css
/* Base glass pattern */
.glass {
  background: rgba(255, 255, 255, 0.08); /* Dark bg: 0.05–0.15 */
  backdrop-filter: blur(16px); /* Subtle: 8–12px, Strong: 20–32px */
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
}

/* Light bg glass */
.glass-light {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}
```

```tsx
// Tailwind
<div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6">
```

---

## 2. Shadow Elevation System

```css
/* Use consistently — don't mix levels randomly */
:root {
  --shadow-1: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-2:
    0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-3:
    0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-4:
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-5: 0 25px 50px -12px rgba(0, 0, 0, 0.18);
}
```

```tsx
// Tailwind — use shadow tokens consistently
<div className="shadow-sm">   {/* Level 1 — barely raised */}
<div className="shadow">      {/* Level 2 — cards */}
<div className="shadow-md">   {/* Level 3 — dropdowns */}
<div className="shadow-lg">   {/* Level 4 — modals */}
<div className="shadow-xl">   {/* Level 5 — floating panels */}
```

**Dark mode:** shadows are invisible on dark backgrounds. Use a subtle inner highlight instead:

```css
/* Dark mode card — glow edge instead of shadow */
.dark .card {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

---

## 3. Gradients

### Linear — Backgrounds & Buttons

```css
/* Subtle section separator */
background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.03) 100%);

/* Brand gradient button */
background: linear-gradient(135deg, oklch(0.55 0.18 250), oklch(0.5 0.2 270));

/* Full-width hero wash */
background: linear-gradient(
  135deg,
  oklch(0.97 0.02 250) 0%,
  oklch(0.99 0 0) 100%
);
```

### Mesh Gradient Hero

```css
/* Multiple radial gradients — organic, non-blob feel */
.hero-bg {
  background-color: oklch(0.99 0 0);
  background-image:
    radial-gradient(
      ellipse 80% 60% at 20% 30%,
      oklch(0.9 0.08 250 / 0.5) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse 60% 50% at 80% 70%,
      oklch(0.88 0.06 200 / 0.4) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse 40% 40% at 60% 20%,
      oklch(0.92 0.05 280 / 0.3) 0%,
      transparent 60%
    );
}
```

> **Rule:** Mesh gradients = max 3 radials, low chroma, subtle opacity. NOT floating neon blobs.

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, oklch(0.55 0.18 250), oklch(0.6 0.2 200));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

```tsx
<span className="bg-gradient-to-r from-brand-500 to-blue-400 bg-clip-text text-transparent">
  Professional Design
</span>
```

---

## 4. Border Effects

### Gradient Border (Dark Mode / Premium Cards)

```css
/* CSS custom property technique */
.gradient-border {
  position: relative;
  background: oklch(0.14 0.01 250);
  border-radius: 1rem;
}

.gradient-border::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    oklch(0.45 0.12 250 / 0.6),
    transparent 50%,
    oklch(0.4 0.1 200 / 0.4)
  );
  z-index: -1;
}
```

```tsx
// Tailwind — simpler approach
<div className="relative rounded-2xl p-px bg-gradient-to-br from-brand-500/30 to-transparent">
  <div className="rounded-2xl bg-zinc-900 p-6">{children}</div>
</div>
```

### Animated Shimmer Border

```css
@keyframes border-spin {
  to {
    --angle: 360deg;
  }
}

@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.animated-border {
  border: 2px solid transparent;
  border-radius: 1rem;
  background:
    linear-gradient(oklch(0.12 0.01 250), oklch(0.12 0.01 250)) padding-box,
    conic-gradient(from var(--angle), transparent 75%, oklch(0.55 0.18 250))
      border-box;
  animation: border-spin 4s linear infinite;
}
```

---

## 5. Glow Effects

```css
/* Subtle element glow — hover state */
.glow-hover:hover {
  box-shadow:
    0 0 20px oklch(0.55 0.18 250 / 0.25),
    0 0 40px oklch(0.55 0.18 250 / 0.12);
}

/* Text glow — use sparingly on hero display text */
.text-glow {
  text-shadow:
    0 0 20px oklch(0.55 0.18 250 / 0.5),
    0 0 40px oklch(0.55 0.18 250 / 0.25);
}

/* Pulsing CTA glow */
@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 12px oklch(0.55 0.18 250 / 0.3);
  }
  50% {
    box-shadow: 0 0 28px oklch(0.55 0.18 250 / 0.6);
  }
}

.glow-pulse {
  animation: glow-pulse 2.5s ease-in-out infinite;
}
```

---

## 6. Overlay Techniques

### Image Text Readability

```css
/* Gradient scrim over photo */
.image-overlay {
  position: relative;
}

.image-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    transparent 100%
  );
  border-radius: inherit;
}
```

```tsx
// Tailwind
<div className="relative overflow-hidden rounded-xl">
  <img src={src} className="w-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
  <div className="absolute bottom-4 left-4 text-white">
    <h3>{title}</h3>
  </div>
</div>
```

---

## 7. Neomorphism

> ⚠️ Low contrast — accessibility risk. Use only for decorative elements, never for primary content.

```css
.neo {
  background: #e8ecf0; /* MUST match parent background exactly */
  box-shadow:
    6px 6px 12px rgba(0, 0, 0, 0.12),
    -6px -6px 12px rgba(255, 255, 255, 0.85);
  border-radius: 0.75rem;
}

.neo-pressed {
  box-shadow:
    inset 4px 4px 8px rgba(0, 0, 0, 0.12),
    inset -4px -4px 8px rgba(255, 255, 255, 0.85);
}
```

---

## 8. Modern CSS — Scroll-Driven Animations (Native)

```css
/* Fade in as element enters viewport — no JavaScript */
@keyframes fade-in-up {
  from {
    opacity: 0;
    translate: 0 20px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

.reveal {
  animation: fade-in-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}

/* Progress bar tied to page scroll */
.progress-bar {
  animation: grow-width linear;
  animation-timeline: scroll(root);
  transform-origin: left;
}

@keyframes grow-width {
  from {
    scalex: 0;
  }
  to {
    scalex: 1;
  }
}
```

---

## 9. Performance Rules

| Property                    | Cost            | Use For                        |
| --------------------------- | --------------- | ------------------------------ |
| `transform`                 | GPU — free      | All movement and scale         |
| `opacity`                   | GPU — free      | All fade effects               |
| `filter` (blur, brightness) | GPU — medium    | Use sparingly                  |
| `box-shadow` on scroll      | CPU — expensive | Static only, not scroll-driven |
| `backdrop-filter`           | GPU — medium    | Limit simultaneous use         |
| `width` / `height`          | CPU — reflow    | Never animate these            |

```css
/* Hint for complex animations */
.will-animate {
  will-change: transform;
  /* Remove after animation completes */
}
```

---

## 10. Effect Selection Checklist

- [ ] Does this effect serve a purpose? (not just "looks cool")
- [ ] Is it appropriate for brand and audience?
- [ ] Have I avoided the AI defaults? (dark + neon + glass)
- [ ] Is contrast maintained for accessibility?
- [ ] Is it GPU-accelerated?
- [ ] Does it degrade gracefully on `prefers-reduced-motion`?
- [ ] Did I test on mobile / low-end devices?

### Anti-Patterns

- ❌ Glassmorphism on every card (kitsch)
- ❌ Dark + neon + glass = "AI design template"
- ❌ Static flat designs with no depth or dimension
- ❌ Effects that hurt text readability
- ❌ Animations on CPU-intensive properties
- ❌ Same mesh gradient on every hero

---

> **Remember**: Effects enhance meaning. Choose based on purpose and context, not because it "looks cool."
