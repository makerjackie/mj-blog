# MakerJackie personal homepage — first visual implementation

## Direction and scope

Personal introduction, three currently maintained projects, a life photograph and conversation, recent writing, and a lightweight collaboration section. Warm paper surface, blue accent taken from the travel photograph, original App icons, restrained hover and entrance motion. On phones the face appears next to the name in the first viewport. Reduced-motion preferences disable these animations and transitions.

Currently maintained projects, confirmed by Jackie: OneApps Studio, 01MVP, shapeof.world. The Other Half and Last Kick remain in the existing archive; they are no longer homepage features. MakerTea is not an equal-priority homepage project in this iteration.

This change covers the web homepage only. The existing about-page edits, mini-program checkout, repository merger, remote mini-program content, and production deployment are outside this delivery.

## Confirmed cooperation copy

- Consultation: CNY 299.
- Guided support: CNY 2999.
- Software development: selectively accept interesting projects or projects related to previous work; discuss scope and pricing individually.
- CNY 399 / 3999 are undecided ideas, not published prices.
- No session duration, delivery schedule, guarantee, or booking/payment function was specified or added.

The current homepage prices and copy live in `apps/web/src/components/home/personal-home.tsx`. Consolidate them into the shared public content document when implementing the mini-program content feed; do not create a second independently maintained price list then.

## Photo handling and asset provenance

Jackie supplied four photographs in the conversation. Two are used. Preserve the originals in `apps/web/public/images/personal/`:

- `jackie-wind-original.jpg`: original `ac638ac790d279df0da30f4be4a6d258.jpg`, unmodified; homepage portrait.
- `jackie-music-original.jpg`: original `70c9c621390eb48b5dc85c8512b5ea17.jpg`, unmodified source.
- `jackie-music-adjusted.jpg`: deterministic adjustment of the music original, **not AI-generated**. Crop rectangle `(70, 210, 710, 1010)` on the 810 × 1080 source; 640 × 800 output. RGB gamma lookup `round(255 * (v / 255) ** 0.88)`, red multiplier 0.995, blue multiplier 1.025, saturation 0.98, JPEG quality 92. No face, hand, instrument or body reconstruction; no generative sharpening or upscaling.

An initial built-in imagegen light-retouch attempt was rejected by Jackie because the person looked unnatural. Its output was not copied to the repository or used in the website. The final direction is original-pixel photographic adjustment, not generative redrawing. The mirror selfie and poster are not used in this homepage version.

Other assets:

- App icons: copied from the local OneApps.Studio website's `apps/web/public/one-apps/assets/` for OneSay, OneWish, OneHabit, OneFrame, OneMarkup, and OneRound. They illustrate the studio, without making availability or maintenance claims about each individual app.
- `shape-black-hole.webp`: copied from oneworld `apps/flutter/assets/posters/landscape/black-hole-flyby.webp`, the project's own theme artwork. It replaces the unsuitable information-dashboard screenshot.
- 01MVP graphic: CSS typographic artwork, not a screenshot or an assertion of a physical book product.

## Verification

Local desktop layout and 390px/320px browser viewport layouts inspected. Chinese and English homepage navigation and copy inspected. No document horizontal overflow at these mobile widths; no broken images reported at inspection. Homepage anchors and WeChat copy success feedback verified. Type-aware lint and type check passed. These checks are local browser evidence, not physical-device or production verification.

## Next stage

Select a real short recording for shapeof.world before adding a video preview. Current project media is a static theme image with a link to the live project. Keep the original photograph treatment when extending the visual system to other pages and the personal WeChat mini-program. Plan the content contract and isolated build environments before any repository move.
