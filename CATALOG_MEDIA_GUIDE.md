# Easy HomeSource Catalog Media Guide

Catalog data lives in `data/homes.ts`. Prices, specs, badges, gallery paths, brochures, video links, SEO text, and standard features should be edited there instead of inside React components.

## 1. Exterior photos
Put exterior photos in:

```text
public/homes/home-slug/exterior/
```

Example: `public/homes/paxton/exterior/paxton-exterior-01.jpg`.

## 2. Interior photos
Put general living room and interior photos in:

```text
public/homes/home-slug/interior/
```

Example: `public/homes/paxton/interior/paxton-living-01.jpg`.

## 3. Floor plans
Put floor plan images in:

```text
public/homes/home-slug/floorplan/
```

Example: `public/homes/paxton/floorplan/paxton-floorplan.jpg`.

## 4. Brochures
Put PDF brochures in:

```text
public/homes/home-slug/brochure/
```

Example: `public/homes/paxton/brochure/paxton-brochure.pdf`.

Then set `brochureUrl` in `data/homes.ts`, for example:

```ts
brochureUrl: "/homes/paxton/brochure/paxton-brochure.pdf"
```

## 5. Videos or video links
Put uploaded video files in:

```text
public/homes/home-slug/video/
```

For hosted videos, set `videoUrl`, `virtualTourUrl`, or `walkthroughVideoUrl` in `data/homes.ts`. Add broader videos and reels to `data/videos.ts` using category values: `Home Tour`, `New Arrival`, `Financing`, `Delivery & Setup`, `Customer Education`, or `Social Reel`.

## 6. Recommended image naming convention
Use lowercase home slugs and two-digit sequence numbers:

```text
home-slug-exterior-01.jpg
home-slug-living-01.jpg
home-slug-kitchen-01.jpg
home-slug-bathroom-01.jpg
home-slug-bedroom-01.jpg
home-slug-floorplan.jpg
home-slug-brochure.pdf
```

## 7. Recommended image sizes
- Hero/exterior images: 1800px wide or larger, landscape orientation when possible.
- Gallery images: 1400px wide or larger.
- Floor plans: 1600px wide or larger, high contrast, readable labels.
- Thumbnails: optional, but keep source images optimized for web.
- Preferred formats: JPG for photos, PNG or JPG for floor plans, PDF for brochures.

## 8. How to add a new home
1. Create `public/homes/new-home-slug/` with these subfolders: `exterior`, `interior`, `kitchen`, `bathroom`, `bedroom`, `floorplan`, `brochure`, and `video`.
2. Add media files using the naming convention above.
3. Add a new seed entry in `data/homes.ts` with `name`, `slug`, specs, price fields, and badge flags.
4. If media paths differ from the default convention, update that home's `gallery`, `floorPlanImage`, `brochureUrl`, and video URL fields.
5. Visit `/homes` and `/homes/new-home-slug` to verify the card and detail page.

## 9. How to mark a home as featured/on-display/special-offer
In `data/homes.ts`, set these flags on the home entry:

```ts
isFeatured: true,
isOnDisplay: true,
isSpecialOffer: true,
isNewArrival: true
```

Set unused badges to `false`. The public home cards and home detail pages read these flags directly.

## 10. How to replace Photo Coming Soon placeholders
The site tries to load the image paths in each home's `gallery`. If the file is missing, it shows a clean placeholder. To replace the placeholder, upload the correctly named image to the matching public folder and keep the path in `data/homes.ts` unchanged.
