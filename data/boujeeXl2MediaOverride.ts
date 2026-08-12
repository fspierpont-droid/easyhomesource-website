import type { HomeMediaManifest } from "@/data/homeMedia";

const sourcePage = "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2";

/** 
 * CORRECTED media manifest for boujee-xl-2.
 * Categories were manually verified by Scott Pierpont on 2026-08-12.
 * Photos 17, 20, and 23 were identified as trash/deletes and excluded.
 */

export const boujeeXl2MediaOverride: HomeMediaManifest = {
  "boujee-xl-2": {
    slug: "boujee-xl-2",
    gallery: [
      // EXTERIOR (9 photos)
      { src: "https://media.ffycdn.net/us/clayton-homes/SnM9U1aPYHnyDtPzeYS9.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 exterior rendering", category: "exterior", isPrimary: true, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/LUJQ47VYnuoyfj6EbVqR.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 exterior alternate color", category: "exterior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/xeAqR2irXrzKzFhWgcPC.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 exterior view", category: "exterior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/5ezdwvGH2RZXqmQSiXSk.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 exterior view", category: "exterior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/wg2y1stNyU6YzvUi7B37.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 exterior view", category: "exterior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/ZKBCdH8dxzvAUasc79Xh.png?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 exterior view", category: "exterior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/4v9pHspcYKGMtEXMXaLX.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 exterior view", category: "exterior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/avXN1cTnNSRNaTJMCCZn.png?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 exterior view", category: "exterior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/7dJ8VdNQYDnmvenczTQy.png?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 exterior view", category: "exterior", isPrimary: false, sourceUrl: sourcePage },

      // INTERIOR / LIVING (3 photos)
      { src: "https://media.ffycdn.net/us/clayton-homes/c4uBzkscLqGBpgiJmQtW.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 living room", category: "interior", isPrimary: true, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/utFXgmgTLYTt4ncWBDds.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 den / living room", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/JUqhQz1r8gHyp1iaPSoW.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 dining area", category: "interior", isPrimary: false, sourceUrl: sourcePage },

      // KITCHEN (6 photos)
      { src: "https://media.ffycdn.net/us/clayton-homes/ShyGaUnm81S5xFSD7TNs.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 kitchen", category: "kitchen", isPrimary: true, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/FtwBvC2ZdqNYb4byy7fu.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 kitchen", category: "kitchen", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/wP2dbb646wCh1KYQraNQ.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 kitchen", category: "kitchen", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/3MdFgsT1s3P5MUyAsjfy.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 kitchen", category: "kitchen", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/gVDAS1rt7Wsp4PzuiycB.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 kitchen", category: "kitchen", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://media.ffycdn.net/us/clayton-homes/yctg5wGa4c4Ya92gAZix.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 kitchen", category: "kitchen", isPrimary: false, sourceUrl: sourcePage },

      // BEDROOM (1 photo)
      { src: "https://media.ffycdn.net/us/clayton-homes/DFY1RbeCacbUYFXaq442.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 bedroom", category: "bedroom", isPrimary: true, sourceUrl: sourcePage },

      // BATHROOM (1 photo)
      { src: "https://media.ffycdn.net/us/clayton-homes/cwkusPWTesw4UM2e7HUk.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 bathroom", category: "bathroom", isPrimary: true, sourceUrl: sourcePage },

      // FLOORPLAN (1 photo)
      { src: "https://media.ffycdn.net/us/clayton-homes/ua8kXitCnRZFbnCtCLKj.jpg?cid=client-tvbsssmtbhwqgn8r", alt: "Boujee XL 2 floor plan", category: "floorplan", isPrimary: true, sourceUrl: sourcePage }
    ],
    floorPlanImage: "https://media.ffycdn.net/us/clayton-homes/ua8kXitCnRZFbnCtCLKj.jpg?cid=client-tvbsssmtbhwqgn8r",
    brochureUrl: null,
    videoUrl: null,
    virtualTourUrl: null,
    sourcePage
  }
};
