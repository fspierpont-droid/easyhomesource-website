import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect("https://easyhomesource.com/privacy", 307);
}
