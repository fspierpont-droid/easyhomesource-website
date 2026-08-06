javascript:(()=>{ 
  "use strict"; 
  const output = { capturedAt: new Date().toISOString(), sourceUrl: location.href, homes: [] }; 
  const SUSPICIOUS_QUERY = /(?:token|auth|session|cookie|signature|signed|jwt|bearer|access[_-]?key|secret|credential|password|expires|policy|x-amz|x-goog|cf-signature)/i; 
  const stripUnsafeQuery = (url) => { 
    try { 
      const parsed = new URL(url); 
      for (const key of Array.from(parsed.searchParams.keys())) { 
        if (SUSPICIOUS_QUERY.test(key) || SUSPICIOUS_QUERY.test(parsed.searchParams.get(key) || "")) parsed.searchParams.delete(key); 
      } 
      parsed.hash = ""; 
      return parsed.toString(); 
    } catch { return url; } 
  }; 
  
  // Directly intercept XMLHttpRequest to catch the raw JSON payload when the page loads or scrolls
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
      this.addEventListener('load', function() {
          try {
              if (this.responseText && this.responseText.includes('sq') && this.responseText.includes('price')) {
                  const data = JSON.parse(this.responseText);
                  window.__EHS_INTERCEPTED_DATA__ = window.__EHS_INTERCEPTED_DATA__ || [];
                  window.__EHS_INTERCEPTED_DATA__.push(data);
              }
          } catch(e) {}
      });
      originalOpen.apply(this, arguments);
  };
  
  // Also try to grab the raw Next.js JSON payload which powers the public catalog
  let rawNextData = null;
  const nextDataScript = document.getElementById('__NEXT_DATA__');
  if (nextDataScript) {
      try {
          rawNextData = JSON.parse(nextDataScript.textContent);
      } catch(e) {}
  }

  alert("EHS Mass Capture initialized. Please slowly scroll down the entire catalog page so all homes load. Once you reach the bottom, click the bookmarklet a SECOND time to download the data.");

  // If clicked a second time, bundle it all up
  window.__EHS_DUMP_DATA__ = function() {
      const payload = {
          source: location.href,
          timestamp: new Date().toISOString(),
          interceptedData: window.__EHS_INTERCEPTED_DATA__ || [],
          nextData: rawNextData
      };
      
      const json = JSON.stringify(payload, null, 2); 
      const html = `<!doctype html><title>EHS Raw Data Dump</title><style>body{font-family:system-ui;margin:24px}textarea{width:100%;height:75vh;font-family:ui-monospace,monospace}</style><h1>EHS Raw Data Dump</h1><p>Copy this huge JSON payload and save it to a file for the AI.</p><textarea autofocus>${json.replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}</textarea>`; 
      
      const win = window.open("", "_blank"); 
      if (win) { 
        win.document.open(); 
        win.document.write(html); 
        win.document.close(); 
      } else { 
        navigator.clipboard?.writeText(json).catch(() => {}); 
        alert("Data copied to clipboard!"); 
      }
  };
  
  if (window.__EHS_RUN_COUNT__) {
      window.__EHS_DUMP_DATA__();
  }
  window.__EHS_RUN_COUNT__ = true;
})();
