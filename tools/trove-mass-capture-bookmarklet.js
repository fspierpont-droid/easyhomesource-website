javascript:(()=>{ 
  "use strict"; 
  const output = {
    capturedAt: new Date().toISOString(),
    sourceUrl: location.href,
    homes: []
  };

  const SUSPICIOUS_QUERY = /(?:token|auth|session|cookie|signature|signed|jwt|bearer|access[_-]?key|secret|credential|password|expires|policy|x-amz|x-goog|cf-signature)/i; 
  
  const stripUnsafeQuery = (url) => { 
    try { 
      const parsed = new URL(url); 
      for (const key of Array.from(parsed.searchParams.keys())) { 
        if (SUSPICIOUS_QUERY.test(key) || SUSPICIOUS_QUERY.test(parsed.searchParams.get(key) || "")) parsed.searchParams.delete(key); 
      } 
      parsed.hash = ""; 
      return parsed.toString(); 
    } catch { 
      return url; 
    } 
  };

  // Find the NEXT_DATA script tag that Next.js uses to hydrate the page
  const nextDataScript = document.getElementById('__NEXT_DATA__');
  if (nextDataScript) {
    try {
      const nextData = JSON.parse(nextDataScript.textContent);
      
      // Look for products/homes in the props
      const pageProps = nextData?.props?.pageProps || {};
      const siteInfo = pageProps?.siteInfo || {};
      
      // Look through all possible data locations in the Trove payload
      let allProducts = [];
      if (Array.isArray(pageProps.products)) allProducts = pageProps.products;
      else if (pageProps.product) allProducts = [pageProps.product];
      else if (pageProps.catalog) allProducts = pageProps.catalog;
      else if (pageProps.inventory) allProducts = pageProps.inventory;
      
      // If we can't find it directly, deeply search for anything that looks like a product list
      if (allProducts.length === 0) {
         const searchForProducts = (obj) => {
            if (!obj || typeof obj !== 'object') return [];
            let found = [];
            for (const key in obj) {
                if (key === 'products' && Array.isArray(obj[key])) found = found.concat(obj[key]);
                else if (Array.isArray(obj[key])) found = found.concat(searchForProducts(obj[key]));
                else if (typeof obj[key] === 'object') found = found.concat(searchForProducts(obj[key]));
            }
            return found;
         };
         allProducts = searchForProducts(nextData.props);
      }

      // Filter and map the data
      output.homes = allProducts.filter(p => p && p.name).map(p => {
         const details = p.details || {};
         const price = p.price || {};
         
         const images = (p.images || []).map(img => ({
            url: stripUnsafeQuery(img.image_url || img.formatted_image_url),
            alt: img.alt || "",
            tags: img.image_tags || []
         }));

         return {
            id: p.id,
            name: p.name,
            slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            manufacturer: p.supplier?.name || p.supplier || "",
            series: p.product_group?.name || p.product_group || "",
            bedrooms: details.bedrooms || null,
            bathrooms: details.bathrooms || null,
            squareFeet: details.square_feet || null,
            width: details.width_inches ? Math.round(details.width_inches / 12) : null,
            length: details.length_inches ? Math.round(details.length_inches / 12) : null,
            startingPrice: price.retail_micros ? price.retail_micros / 1000000 : null,
            images: images
         };
      });

    } catch (e) {
      alert("Error parsing Next.js data: " + e.message);
    }
  }

  // Fallback: If no NEXT_DATA, try to scrape DOM
  if (output.homes.length === 0) {
     alert("No structural data found. Make sure you are on the main Catalog or Inventory page.");
     return;
  }

  const json = JSON.stringify(output, null, 2); 
  const html = `<!doctype html><title>EHS Mass Capture JSON</title><style>body{font-family:system-ui;margin:24px}textarea{width:100%;height:75vh;font-family:ui-monospace,monospace}</style><h1>EHS Mass Capture JSON (${output.homes.length} homes found)</h1><p>Copy this JSON and paste it to the AI!</p><textarea autofocus>${json.replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}</textarea>`; 
  
  navigator.clipboard?.writeText(json).catch(() => {}); 
  
  const win = window.open("", "_blank"); 
  if (win) { 
    win.document.open(); 
    win.document.write(html); 
    win.document.close(); 
  } else { 
    alert("Copied " + output.homes.length + " homes to clipboard!"); 
  } 
})();
