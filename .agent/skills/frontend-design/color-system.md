# Color System Reference

> Color theory principles, selection process, and decision-making guidelines.
> **No memorized hex codes - learn to THINK about color.**

---

## 1. Color Theory Fundamentals

### The Color Wheel

```
                    YELLOW
                      │
           Yellow-    │    Yellow-
           Green      │    Orange
              ╲       │       ╱
               ╲      │      ╱
    GREEN ─────────── ● ─────────── ORANGE
               ╱      │      ╲
              ╱       │       ╲
           Blue-      │    Red-
           Green      │    Orange
                      │
                     RED
                      │
                   PURPLE
                  ╱       ╲
             Blue-         Red-
             Purple        Purple
                  ╲       ╱
                    BLUE
```

### Color Relationships

| Scheme                  | How to Create                                | When to Use                       |
| ----------------------- | -------------------------------------------- | --------------------------------- |
| **Monochromatic**       | Pick ONE hue, vary only lightness/saturation | Minimal, professional, cohesive   |
| **Analogous**           | Pick 2-3 ADJACENT hues on wheel              | Harmonious, calm, nature-inspired |
| **Complementary**       | Pick OPPOSITE hues on wheel                  | High contrast, vibrant, attention |
| **Split-Complementary** | Base + 2 colors adjacent to complement       | Dynamic but balanced              |
| **Triadic**             | 3 hues EQUIDISTANT on wheel                  | Vibrant, playful, creative        |

### How to Choose a Scheme:

1. **What's the project mood?** Calm → Analogous. Bold → Complementary.
2. **How many colors needed?** Minimal → Monochromatic. Complex → Triadic.
3. **Who's the audience?** Conservative → Monochromatic. Young → Triadic.

---

## 2. The 60-30-10 Rule

### Distribution Principle

```
┌─────────────────────────────────────────────────┐
│                                                 │
│     60% PRIMARY (Background, large areas)       │
│     → Should be neutral or calming              │
│     → Carries the overall tone                  │
│                                                 │
├────────────────────────────────────┬────────────┤
│                                    │            │
│   30% SECONDARY                    │ 10% ACCENT │
│   (Cards, sections, headers)       │ (CTAs,     │
│   → Supports without dominating    │ highlights)│
│                                    │ → Draws    │
│                                    │   attention│
└────────────────────────────────────┴────────────┘
```

### Implementation Pattern

```css
:root {
  /* 60% - Pick based on light/dark mode and mood */
  --color-bg: /* neutral: white, off-white, or dark gray */ --color-surface:
    /* slightly different from bg */
    /* 30% - Pick based on brand or context */
    --color-secondary: /* muted version of primary or neutral */
    /* 10% - Pick based on desired action/emotion */
    --color-accent: /* vibrant, attention-grabbing */;
}
```

---

## 3. Color Psychology - Meaning & Selection

### How to Choose Based on Context

| If Project Is...              | Consider These Hues    | Why                          |
| ----------------------------- | ---------------------- | ---------------------------- |
| **Finance, Tech, Healthcare** | Blues, Teals           | Trust, stability, calm       |
| **Eco, Wellness, Nature**     | Greens, Earth tones    | Growth, health, organic      |
| **Food, Energy, Youth**       | Orange, Yellow, Warm   | Appetite, excitement, warmth |
| **Luxury, Beauty, Creative**  | Deep Teal, Gold, Black | Sophistication, premium      |
| **Urgency, Sales, Alerts**    | Red, Orange            | Action, attention, passion   |

### Emotional Associations (For Decision Making)

| Hue Family | Positive Associations             | Cautions                             |
| ---------- | --------------------------------- | ------------------------------------ |
| **Blue**   | Trust, calm, professional         | Can feel cold, corporate             |
| **Green**  | Growth, nature, success           | Can feel boring if overused          |
| **Red**    | Passion, urgency, energy          | High arousal, use sparingly          |
| **Orange** | Warmth, friendly, creative        | Can feel cheap if saturated          |
| **Purple** | ⚠️ **BANNED** - AI overuses this! | Use Deep Teal/Maroon/Emerald instead |
| **Yellow** | Optimism, attention, happy        | Hard to read, use as accent          |
| **Black**  | Elegance, power, modern           | Can feel heavy                       |
| **White**  | Clean, minimal, open              | Can feel sterile                     |

### Selection Process:

1. **What industry?** → Narrow to 2-3 hue families
2. **What emotion?** → Pick primary hue
3. **What contrast?** → Decide light vs dark mode
4. **ASK USER** → Confirm before proceeding

---

## 3.5 OKLCH — The Modern Standard (Tailwind v4)

Tailwind v4 uses OKLCH for all design tokens. Prefer OKLCH over HSL for any new project — it's perceptually uniform, meaning equal numeric steps look visually equal to the human eye.

```
OKLCH = Lightness, Chroma, Hue
├── L (0–1):    Perceptual lightness (0 = black, 1 = white)
├── C (0–0.4):  Chroma/saturation (0 = gray, 0.4 = max vivid)
└── H (0–360):  Hue angle (same as HSL)
```

### HSL → OKLCH Conversion Guide

| Feeling       | HSL Example        | OKLCH Equivalent       |
| ------------- | ------------------ | ---------------------- |
| Brand blue    | `hsl(220 80% 55%)` | `oklch(0.55 0.18 250)` |
| Success green | `hsl(145 60% 45%)` | `oklch(0.55 0.15 145)` |
| Warning amber | `hsl(38 90% 50%)`  | `oklch(0.65 0.18 65)`  |
| Error red     | `hsl(0 75% 50%)`   | `oklch(0.50 0.22 25)`  |
| Neutral dark  | `hsl(220 10% 15%)` | `oklch(0.18 0.02 250)` |

### Generating a Full Palette in OKLCH

```css
@theme {
  /* Brand — vary L from 0.97 to 0.20, keep C and H consistent */
  --color-brand-50: oklch(0.97 0.03 250);
  --color-brand-100: oklch(0.93 0.05 250);
  --color-brand-200: oklch(0.86 0.08 250);
  --color-brand-300: oklch(0.76 0.12 250);
  --color-brand-400: oklch(0.65 0.16 250);
  --color-brand-500: oklch(0.55 0.18 250); /* base */
  --color-brand-600: oklch(0.47 0.18 250);
  --color-brand-700: oklch(0.38 0.16 250);
  --color-brand-800: oklch(0.3 0.12 250);
  --color-brand-900: oklch(0.2 0.08 250);

  /* Semantic tokens — what the app actually uses */
  --color-primary: var(--color-brand-500);
  --color-primary-hover: var(--color-brand-600);
  --color-surface: oklch(0.99 0 0);
  --color-surface-raised: oklch(0.97 0 0);
}
```

### Dark Mode — OKLCH Rules

```css
.dark {
  --color-surface: oklch(0.12 0.01 250); /* NOT pure black */
  --color-surface-raised: oklch(0.16 0.01 250); /* Elevation = lighter */
  --color-surface-overlay: oklch(0.2 0.01 250);
  --color-primary: oklch(0.65 0.16 250); /* Slightly lighter in dark */
  --color-text: oklch(0.93 0 0); /* NOT pure white */
  --color-text-secondary: oklch(0.7 0 0);
}
```

---

## 4. Palette Generation Principles

### From a Single Color (HSL Method)

Instead of memorizing hex codes, learn to **manipulate HSL**:

```
HSL = Hue, Saturation, Lightness

Hue (0-360): The color family
  0/360 = Red
  60 = Yellow
  120 = Green
  180 = Cyan
  240 = Blue
  300 = Purple

Saturation (0-100%): Color intensity
  Low = Muted, sophisticated
  High = Vibrant, energetic

Lightness (0-100%): Brightness
  0% = Black
  50% = Pure color
  100% = White
```

### Generating a Full Palette

Given ANY base color, create a scale:

```
Lightness Scale:
  50  (lightest) → L: 97%
  100            → L: 94%
  200            → L: 86%
  300            → L: 74%
  400            → L: 66%
  500 (base)     → L: 50-60%
  600            → L: 48%
  700            → L: 38%
  800            → L: 30%
  900 (darkest)  → L: 20%
```

### Saturation Adjustments

| Context                    | Saturation Level                     |
| -------------------------- | ------------------------------------ |
| **Professional/Corporate** | Lower (40-60%)                       |
| **Playful/Youth**          | Higher (70-90%)                      |
| **Dark Mode**              | Reduce by 10-20%                     |
| **Accessibility**          | Ensure contrast, may need adjustment |

---

## 5. Context-Based Selection Guide

### Instead of Copying Palettes, Follow This Process:

**Step 1: Identify the Context**

```
What type of project?
├── E-commerce → Need trust + urgency balance
├── SaaS/Dashboard → Need low-fatigue, data focus
├── Health/Wellness → Need calming, natural feel
├── Luxury/Premium → Need understated elegance
├── Creative/Portfolio → Need personality, memorable
└── Other → ASK the user
```

**Step 2: Select Primary Hue Family**

```
Based on context, pick ONE:
- Blue family (trust)
- Green family (growth)
- Warm family (energy)
- Neutral family (elegant)
- OR ask user preference
```

**Step 3: Decide Light/Dark Mode**

```
Consider:
- User preference?
- Industry standard?
- Content type? (text-heavy = light preferred)
- Time of use? (evening app = dark option)
```

**Step 4: Generate Palette Using Principles**

- Use HSL manipulation
- Follow 60-30-10 rule
- Check contrast (WCAG)
- Test with actual content

---

## 6. Dark Mode Principles

### Key Rules (No Fixed Codes)

1. **Never pure black** → Use very dark gray with slight hue
2. **Never pure white text** → Use 87-92% lightness
3. **Reduce saturation** → Vibrant colors strain eyes in dark mode
4. **Elevation = brightness** → Higher elements slightly lighter

### Contrast in Dark Mode

```
Background layers (darker → lighter as elevation increases):
Layer 0 (base)    → Darkest
Layer 1 (cards)   → Slightly lighter
Layer 2 (modals)  → Even lighter
Layer 3 (popups)  → Lightest dark
```

### Adapting Colors for Dark Mode

| Light Mode             | Dark Mode Adjustment          |
| ---------------------- | ----------------------------- |
| High saturation accent | Reduce saturation 10-20%      |
| Pure white background  | Dark gray with brand hue tint |
| Black text             | Light gray (not pure white)   |
| Colorful backgrounds   | Desaturated, darker versions  |

---

## 7. Accessibility Guidelines

### Contrast Requirements (WCAG)

| Level          | Normal Text | Large Text |
| -------------- | ----------- | ---------- |
| AA (minimum)   | 4.5:1       | 3:1        |
| AAA (enhanced) | 7:1         | 4.5:1      |

### How to Check Contrast

1. **Convert colors to luminance**
2. **Calculate ratio**: (lighter + 0.05) / (darker + 0.05)
3. **Adjust until ratio meets requirement**

### Safe Patterns

| Use Case             | Guideline                         |
| -------------------- | --------------------------------- |
| **Text on light bg** | Use lightness 35% or less         |
| **Text on dark bg**  | Use lightness 85% or more         |
| **Primary on white** | Ensure dark enough variant        |
| **Buttons**          | High contrast between bg and text |

---

## 8. Color Selection Checklist

Before finalizing any color choice, verify:

- [ ] **Asked user preference?** (if not specified)
- [ ] **Matches project context?** (industry, audience)
- [ ] **Follows 60-30-10?** (proper distribution)
- [ ] **WCAG compliant?** (contrast checked)
- [ ] **Works in both modes?** (if dark mode needed)
- [ ] **NOT your default/favorite?** (variety check)
- [ ] **Different from last project?** (avoid repetition)

---

## 9. Anti-Patterns to Avoid

### ❌ DON'T:

- Copy the same hex codes every project
- Default to purple/violet (AI tendency)
- Default to dark mode + neon (AI tendency)
- Use pure black (#000000) backgrounds
- Use pure white (#FFFFFF) text on dark
- Ignore user's industry context
- Skip asking user preference

### ✅ DO:

- Generate fresh palette per project
- Ask user about color preferences
- Consider industry and audience
- Use HSL for flexible manipulation
- Test contrast and accessibility
- Offer light AND dark options

---

> **Remember**: Colors are decisions, not defaults. Every project deserves thoughtful selection based on its unique context.
