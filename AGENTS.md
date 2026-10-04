# Architecture rules
- Future-self projections use the provider-neutral `future-self` server function; browser code never calls an image provider or holds its key, preserving security and provider replaceability.
- The home viewer uses the user's actual Digital You imagery with perspective motion rather than a generic 3D avatar, preserving identity while providing a 3D-style experience.
