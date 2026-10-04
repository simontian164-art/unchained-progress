# Architecture rules
- Future-self projections use the provider-neutral `future-self` server function; browser code never calls an image provider or holds its key, preserving security and provider replaceability.
- The home viewer uses the user's actual Digital You imagery with perspective motion rather than a generic 3D avatar, preserving identity while providing a 3D-style experience.
- MetaPerson avatar creator runs in its iframe; the browser gets only a short-lived token from the `metaperson-token` server function, so developer credentials never reach the client.
- Virtual try-on runs in the `try-on` server function on the built-in AI image editor (no third-party vendor or key), returning the finished image in one request.
