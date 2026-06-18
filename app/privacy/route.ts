import { readFile } from "node:fs/promises";
import path from "node:path";

function rewriteSavedPageAssetPaths(html: string) {
  return html
    .replaceAll("ehs-privacy_files/", "/legal/ehs-privacy_files/")
    .replaceAll("Privacy Policy_files/", "/legal/Privacy Policy_files/")
    .replaceAll("easyhomesource-privacy_files/", "/legal/easyhomesource-privacy_files/");
}

export async function GET() {
  const html = await readFile(path.join(process.cwd(), "public/legal/easyhomesource-privacy.html"), "utf8");
  return new Response(rewriteSavedPageAssetPaths(html), {
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}
