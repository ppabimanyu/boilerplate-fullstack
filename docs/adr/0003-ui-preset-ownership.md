---
status: accepted
---

# The preset owns the theme; the house layer owns the graphics

The template's visual system is a shadcn preset (`radix-luma`, id `b3lnkvlhY`). It decides colour, radius, typography, and the shape of every primitive. `frontend/src/brand` only adds the identity graphics — registration mark, crop marks, brand bar, and the service chart — and reads its ink from `--brand`, which maps to `--primary`. The house layer must not declare its own palette, font, or radius values.

## Considered Options

- **Keep the bespoke theme and layer the preset's components on top.** This is what a partial `apply` produces: two systems disagreeing on radii, fonts, and primary colour, with the house tokens silently overriding the preset. Rejected after seeing the hybrid.
- **Pin only the preset id and no ownership rule.** Rejected: the next reader would not know whether a radius or colour value belongs to the preset or to the house.
- **Edit generated primitives to match a house style.** Rejected for the same reason as ADR-0001: regeneration erases the edits.

## Consequences

- Swapping the preset changes the whole look in one command, and the house graphics follow because they never hard-code colour.
- A house colour, radius, or typeface change is a preset change, not a CSS override. Adding a parallel `--brand` hex would recreate the split this ADR removes.
- The identity that survives a preset swap is the mark, the chart, the crop marks, and the shell layout. That is the intended scope of "house style".
- A service chart cell derives from the service name, so it is stable across presets.
