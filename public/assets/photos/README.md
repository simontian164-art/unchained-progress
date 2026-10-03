# Licensed photography only

Nothing goes in these folders unless it's recorded in `docs/ASSET_SOURCES.md` with licence, source, creator,
model release (if a person is recognisable) and date. Register each file in `src/app/visuals/references.ts`;
pages never import photos directly.

- `hair/`      haircut references per cut and hair texture (e.g. `crop-curly-1.webp`, 480w + 960w)
- `style/`     outfit references per style board
- `skin/`      routine/technique photos (no extreme close-ups)
- `grooming/`  beard lines, brow grooming
- `body/`      exercise form photos
- `product/`   product packshots (only with retailer/brand permission)

Rules: WebP, max 960px wide, `loading="lazy"`, 4:5 for people, 1:1 for products. No stock model may be
presented as a GlowMax customer, a testimonial, an analysis subject or a before/after.
