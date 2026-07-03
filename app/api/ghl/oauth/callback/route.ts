import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const backendBase = (process.env.EHS_BACKEND_URL || "https://ehs-api-staging.onrender.com").replace(/\/$/, "");
  const target = new URL("/api/integrations/ghl/oauth/callback", backendBase);

  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    target.searchParams.append(key, value);
  }

  return NextResponse.redirect(target, 302);
}
