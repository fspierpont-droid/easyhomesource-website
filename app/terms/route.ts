import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect("https://easyhomesource.com/terms", 307);
}
