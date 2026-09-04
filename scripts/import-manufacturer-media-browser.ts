const nativeFetch = globalThis.fetch;

/**
 * Manufacturer sites commonly serve different markup to obvious bot user agents.
 * This wrapper requests the same public pages a normal browser receives and also
 * normalizes Timber Creek's dealer-scoped URLs to the canonical floorplan pages,
 * where the complete gallery is published.
 */
globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
  let requestInput: string | URL | Request = input;

  if (typeof input === "string" || input instanceof URL) {
    const raw = String(input);
    const normalized = raw.replace(
      /\/floorplan\/(\d+)-5774\/easy-homesource\/hernando\/creekside-series\//i,
      "/floorplan/$1/creekside-series/",
    );
    requestInput = normalized;
  }

  const headers = new Headers(init?.headers);
  headers.set(
    "user-agent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
  );
  headers.set("accept-language", "en-US,en;q=0.9");
  headers.set("cache-control", "no-cache");

  return nativeFetch(requestInput, { ...init, headers });
};

await import("./import-manufacturer-media.ts");
