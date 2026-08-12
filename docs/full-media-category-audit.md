# Full Website Media Category Audit

## Audit Date: 2026-08-12
## Auditor: Kimi (AI assistant) + Scott Pierpont (manual verification)

---

## Summary

| Status | Count | Homes |
|--------|-------|-------|
| ✅ **Correct** | 21 homes | See list below |
| ❌ **Fixed** | 1 home | Boujee XL 2 |
| ⚠️ **Needs Review** | 1 home | Oak |

---

## ✅ Homes with Correct Photo Categories (21 homes)

These homes have properly categorized photos. No action needed.

### Display Homes
| Home | Source | Photo Count | Categories Used |
|------|--------|-------------|-----------------|
| **Tulip** | Local assets (tulipManufacturerMedia.ts) | 6 | exterior, interior, kitchen, bedroom, bathroom, floorplan |
| **Dogwood** | Local assets (scraped) | 12 | exterior, interior, kitchen, bedroom, bathroom, floorplan |
| **Born to Run** | Trove CDN (scraped) | 15 | exterior, interior, bedroom, bathroom, kitchen, floorplan |
| **Classic C-1672-32C** | Trove CDN (scraped) | 23 | interior, kitchen, bedroom, bathroom |
| **Move on Up** | Trove CDN (scraped) | 15 | exterior, interior, bedroom, bathroom, kitchen, floorplan |
| **Paxton** | Trove CDN (scraped) | 24 | exterior, interior, kitchen, bedroom, bathroom |
| **Craft Select 28603A** | Cavco CDN (scraped) | 3 | exterior, floorplan |
| **Atmos 28603N** | Trove CDN (scraped) | 23 | exterior, kitchen, interior, bathroom |
| **Hey Jude** | Trove CDN (scraped) | 17 | exterior, bathroom, bedroom, interior, kitchen, floorplan |
| **Delilah** | Local assets (scraped) | 28 | exterior, interior, kitchen, bedroom, bathroom, other, floorplan |
| **Maple** | Local assets (scraped) | 12 | exterior, interior, kitchen, bedroom, bathroom, floorplan |
| **White Oak** | Local assets (scraped) | 27 | exterior, interior, kitchen, bedroom, bathroom, other, floorplan |

### Catalog / Lineup Homes
| Home | Source | Photo Count | Categories Used |
|------|--------|-------------|-----------------|
| **Boujee 2** | Local assets (boujee2ManufacturerMedia.ts) | 17 | floorplan, interior |
| **Craft Select 15663A** | Local assets (craftSelect15663aManufacturerMedia.ts) | 1 | floorplan |
| **Select S-1234-32A** | Local assets (scraped) | 18 | exterior, interior, kitchen, bedroom, bathroom, floorplan |
| **Select S-1234-31A** | Local assets (scraped) | 19 | exterior, interior, kitchen, bedroom, bathroom, floorplan |
| **Select S-1444-11OFP** | Local assets (scraped) | 5 | exterior, interior, kitchen, bedroom, floorplan |
| **Elm** | Local assets (scraped) | 9 | exterior, interior, kitchen, bedroom, bathroom, floorplan |
| **Select S-1236-11FLA** | Local assets (scraped) | 36 | exterior, interior, kitchen, bedroom, bathroom, floorplan |
| **Select S-1240-22A** | Trove CDN (catalog) | 2 | exterior, floorplan |
| **Select S-1256-21A** | Trove CDN (catalog) | 2 | exterior, floorplan |
| **Select S-1264-22A** | Trove CDN (catalog) | 2 | exterior, floorplan |
| **Select S-1272-32A** | Trove CDN (catalog) | 1 | floorplan |
| **Imagine** | Trove CDN (catalog) | 2 | exterior, floorplan |
| **Waverly 15471A** | Trove CDN (catalog) | 2 | exterior, floorplan |
| **Workforce O-1644-22AOF** | Trove CDN (catalog) | 2 | exterior, floorplan |

---

## ❌ Fixed Homes (1 home)

### Boujee XL 2 — FIXED via `boujeeXl2MediaOverride.ts`

| Problem | Fix |
|---------|-----|
| Scraper tagged exterior rendering as "floorplan" | Changed to "exterior" |
| Scraper tagged living room as "exterior" | Changed to "interior" |
| Scraper tagged 16 mixed photos as generic "interior" | Manually categorized as exterior, kitchen, bedroom, bathroom, interior |
| 3 trash photos included | Removed from gallery |
| Floorplan URL was wrong | Set to correct floorplan image |

**Result:** 9 exterior, 3 interior/living, 6 kitchen, 1 bedroom, 1 bathroom, 1 floorplan

---

## ⚠️ Homes Needing Review (1 home)

### Oak — Needs Manual Categorization

**Problem:** The scraper pulled 15 photos from Clayton's CDN and tagged 12 of them as generic "interior". These need to be reviewed and assigned proper categories (kitchen, bedroom, bathroom, living room, etc.).

**Photos to review:**

| # | URL | Current Category | Needs Review |
|---|-----|-----------------|--------------|
| 1 | https://api.claytonhomes.com/images/mfg/int/872a2045-3aae-4307-a1c2-dafe8c7dc647.jpg | interior | ⚠️ YES |
| 2 | https://api.claytonhomes.com/images/mfg/int/5fd281b1-6238-4cf6-85c5-8d18018b4882.jpg | interior | ⚠️ YES |
| 3 | https://api.claytonhomes.com/images/mfg/int/7e552794-7b6f-4207-b8d5-8cc48d4b7f32.jpg | interior | ⚠️ YES |
| 4 | https://api.claytonhomes.com/images/mfg/int/df1ba59e-3196-4aeb-95fa-24d54f9772ae.jpg | interior | ⚠️ YES |
| 5 | https://api.claytonhomes.com/images/mfg/int/40233ba5-e41c-4ee1-a3fc-f2a1e1e3e481.jpg | interior | ⚠️ YES |
| 6 | https://api.claytonhomes.com/images/mfg/int/a1268c5c-ee8d-4353-9624-0e2ebc2a4620.jpg | interior | ⚠️ YES |
| 7 | https://api.claytonhomes.com/images/mfg/int/81f23c49-2436-4507-83c7-97de468b9035.jpg | interior | ⚠️ YES |
| 8 | https://api.claytonhomes.com/images/mfg/int/4584528f-6b1c-4e2d-920d-41fac2edea13.jpg | interior | ⚠️ YES |
| 9 | https://api.claytonhomes.com/images/mfg/int/55de80c7-e22b-4575-85b4-22bd5e0f6de3.jpg | interior | ⚠️ YES |
| 10 | https://api.claytonhomes.com/images/mfg/int/19ed1fa6-2efa-46d3-9fb8-011d6c853e4c.jpg | interior | ⚠️ YES |
| 11 | https://api.claytonhomes.com/images/mfg/int/cd907f0b-fcbf-4d8c-aa71-912cc3e94271.jpg | interior | ⚠️ YES |
| 12 | https://api.claytonhomes.com/images/mfg/int/eb9a36b9-f0d4-4b55-afa2-507ce6b15470.jpg | interior | ⚠️ YES |

**Already correct:**
- 2 floorplans ✅
- 1 exterior ✅

**How to fix:** Open each URL in a browser tab, identify the room, then edit `data/oakMediaOverride.ts` and change the category field.

---

## Notes

- **Atmos 28603N** has many "interior" tagged photos, but the alt text explicitly says "interior home features" — these are legitimately generic interior shots (living room, dining, foyer, etc.). They are not miscategorized, just less specific than ideal. No action needed unless you want to manually split them into kitchen/bedroom/bathroom.
- **Classic C-1672-32C** has no floorplan image assigned (`floorPlanImage: null`). This is a data gap, not a categorization issue.
- **Paxton** has no floorplan image assigned (`floorPlanImage: null`). This is a data gap, not a categorization issue.
- **Select S-1272-32A** only has a floorplan, no model photos. This is a known gap documented in the catalog audit.
- **Creekside Series** has no media at all. This is a known gap.
- **Timberland** has no media at all. This is a known gap.
