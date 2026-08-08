import { NextResponse } from 'next/server';
import { homes } from '@/data/homes';
import { siteInfo } from '@/data/site';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const query = (message || '').toLowerCase();

    let reply = '';
    let actionType: 'text' | 'homes' | 'lead_form' | 'tour_booking' | 'financing_info' = 'text';
    let matchedHomes: any[] = [];

    // 1. Specific model matches
    if (query.includes('tulip') || query.includes('39') || query.includes('cheap') || query.includes('lowest') || query.includes('starter')) {
      const tulip = homes.find(h => h.slug === 'tulip');
      if (tulip) {
        matchedHomes = [{
          slug: tulip.slug,
          name: tulip.name,
          bedrooms: tulip.bedrooms,
          bathrooms: tulip.bathrooms,
          squareFeet: tulip.squareFeet,
          size: tulip.size,
          displayPrice: '$39,888',
          image: tulip.gallery?.[0]?.src || 'https://api.claytonhomes.com/images/mfg/ext/78245a95-726c-41a2-a359-99575118929b.jpg?width=992',
          tagline: 'Our featured budget-friendly 2-bed starter home.'
        }];
      }
      reply = `The most affordable home in our Brooksville lineup is **The Tulip**, starting at **$39,888**! It’s a 2-bed, 1-bath single wide (544 sq. ft.) on display at our dealership. Would you like to request a turnkey quote or schedule a walk-through?`;
      actionType = 'homes';
    } else if (query.includes('under 100k') || query.includes('under 100,000') || query.includes('under $100k') || query.includes('budget')) {
      const budgetHomes = homes.filter(h => (h.startingPrice ?? 999999) <= 100000 && h.isOnDisplay).slice(0, 4);
      matchedHomes = budgetHomes.map(h => ({
        slug: h.slug,
        name: h.name,
        bedrooms: h.bedrooms,
        bathrooms: h.bathrooms,
        squareFeet: h.squareFeet,
        size: h.size,
        displayPrice: h.startingPrice ? `Starting at $${Math.round(h.startingPrice).toLocaleString()}` : 'Call for price',
        image: h.gallery?.[0]?.src || null,
        tagline: h.shortDescription?.slice(0, 70) + '...'
      }));
      reply = `We have several great models under $100,000 available to tour or order in Brooksville:
• **Tulip** (2 Bed / 1 Bath, 544 sq ft) – From **$39,888**
• **Dogwood** (2 Bed / 2 Bath, 790 sq ft) – From **$61,900**
• **Classic C-1672** (3 Bed / 2 Bath, 1,068 sq ft) – From **$83,447**
• **Born to Run** (2 Bed / 2 Bath, 900 sq ft) – From **$89,875**
• **Move on Up** (3 Bed / 2 Bath, 1,080 sq ft) – From **$90,136**

Which size fits your property and family best?`;
      actionType = 'homes';
    } else if (query.includes('3 bed') || query.includes('3-bed') || query.includes('3 bedroom') || query.includes('three bed')) {
      const threeBeds = homes.filter(h => h.bedrooms === 3 && h.isOnDisplay).slice(0, 4);
      matchedHomes = threeBeds.map(h => ({
        slug: h.slug,
        name: h.name,
        bedrooms: h.bedrooms,
        bathrooms: h.bathrooms,
        squareFeet: h.squareFeet,
        size: h.size,
        displayPrice: h.startingPrice ? `Starting at $${Math.round(h.startingPrice).toLocaleString()}` : 'Call for price',
        image: h.gallery?.[0]?.src || null
      }));
      reply = `Here are our popular 3-bedroom models on display or available to order in Brooksville:
• **Classic C-1672-32C** (3 Bed / 2 Bath, 1,068 sq ft)
• **Move on Up** (3 Bed / 2 Bath, 1,080 sq ft)
• **Craft Select 28603A** (3 Bed / 2 Bath, 1,680 sq ft double wide)
• **Atmos 28603N** (3 Bed / 2 Bath, 1,600 sq ft)
• **Paxton 28523A** (3 Bed / 2 Bath, 1,394 sq ft)

Do you own property in Florida, or are you looking for a land-and-home package?`;
      actionType = 'homes';
    } else if (query.includes('4 bed') || query.includes('5 bed') || query.includes('double wide') || query.includes('large') || query.includes('family')) {
      const largeHomes = homes.filter(h => (h.bedrooms ?? 0) >= 4).slice(0, 3);
      matchedHomes = largeHomes.map(h => ({
        slug: h.slug,
        name: h.name,
        bedrooms: h.bedrooms,
        bathrooms: h.bathrooms,
        squareFeet: h.squareFeet,
        size: h.size,
        displayPrice: h.startingPrice ? `Starting at $${Math.round(h.startingPrice).toLocaleString()}` : 'Call for price',
        image: h.gallery?.[0]?.src || null
      }));
      reply = `For larger families needing 4 or 5 bedrooms, we have spacious double wides:
• **Oak** (4 Bed / 2 Bath, 1,475 sq ft) – From **$84,608**
• **Hey Jude** (5 Bed / 2 Bath, 1,896 sq ft) – From **$128,101**
• **Boujee XL 2** (4 Bed / 3 Bath, 1,980 sq ft luxury master) – From **$147,374**

Would you like to walk through them on our Brooksville lot?`;
      actionType = 'homes';
    } else if (query.includes('tour') || query.includes('visit') || query.includes('appointment') || query.includes('see home') || query.includes('address') || query.includes('lot') || query.includes('hours')) {
      reply = `We'd love to welcome you! Easy HomeSource has **11 fully furnished display homes** you can walk through at **${siteInfo.address}**.

• **Hours:** Monday – Saturday: 9:00 AM – 6:00 PM (Sunday by appointment)
• **Phone:** [${siteInfo.phoneDisplay}](tel:${siteInfo.phoneHref})

Use the quick form below to pick your preferred date and time, and our team will prepare a walkthrough packet for you!`;
      actionType = 'tour_booking';
    } else if (query.includes('quote') || query.includes('price') || query.includes('cost') || query.includes('estimate') || query.includes('how much')) {
      reply = `Base home prices start at **$39,888** for our Tulip model up to luxury multi-section homes. 

A complete turnkey project quote covers:
1. **Home Model & Features**
2. **Factory Freight Delivery** to your Florida property
3. **Site Installation & Tie-Downs** (blocking, anchoring, skirting, steps, A/C heat pump)
4. **Site Prep & Utilities** (pad/stem-wall, power hookup, well & septic or county sewer)
5. **Permits & Inspections** (Hernando, Pasco, Citrus, Sumter)

Fill out the quote form below and we'll calculate a turnkey estimate for you!`;
      actionType = 'lead_form';
    } else if (query.includes('finance') || query.includes('financing') || query.includes('loan') || query.includes('credit') || query.includes('down payment') || query.includes('fha')) {
      reply = `Easy HomeSource connects Florida buyers with specialized manufactured home lenders for:
• **Chattel (Home-Only) Loans:** For homes in parks, family land, or private lots.
• **Land & Home Mortgages:** (FHA, VA, USDA, Conventional) bundling land, home, and all site work into one monthly payment.
• **Down Payment:** Typically ranges from 5% to 20% depending on program pre-qualification.

*Note: Financing availability, rates, and terms are determined by licensed third-party lenders. Easy HomeSource provides guidance and connects you with qualified lending partners.*`;
      actionType = 'financing_info';
    } else if (query.includes('land') || query.includes('lot') || query.includes('property') || query.includes('zoning') || query.includes('septic') || query.includes('well')) {
      reply = `Whether you already have property or are looking for a lot in Central Florida:
• **If you own land:** We assist with site inspections, Hernando/Pasco/Citrus zoning verification, well & septic or municipal hookups, and county building permits.
• **If you need land:** We can package land and home together into one turnkey purchase.

Do you currently own Florida property, or are you shopping for land?`;
      actionType = 'lead_form';
    } else {
      const featured = homes.filter(h => h.isFeatured && h.isOnDisplay).slice(0, 3);
      matchedHomes = featured.map(h => ({
        slug: h.slug,
        name: h.name,
        bedrooms: h.bedrooms,
        bathrooms: h.bathrooms,
        squareFeet: h.squareFeet,
        size: h.size,
        displayPrice: h.startingPrice ? `Starting at $${Math.round(h.startingPrice).toLocaleString()}` : '$39,888',
        image: h.gallery?.[0]?.src || 'https://api.claytonhomes.com/images/mfg/ext/78245a95-726c-41a2-a359-99575118929b.jpg?width=992'
      }));
      reply = `Hello! Welcome to **Easy HomeSource** in Brooksville, Florida (${siteInfo.phoneDisplay}). 

We specialize in affordable manufactured homes with transparent pricing, from our **$39,888 Tulip** starter home to 4 & 5-bedroom luxury models.

How can I help you today?
• Browse homes under $100k
• Schedule a tour of our 11 on-lot display models
• Turnkey land, delivery, setup & permitting questions
• Financing & pre-qualification guidance`;
      actionType = 'homes';
    }

    return NextResponse.json({
      success: true,
      reply,
      actionType,
      homes: matchedHomes
    });
  } catch (error) {
    console.error('Easy HomeSource Chatbot error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
