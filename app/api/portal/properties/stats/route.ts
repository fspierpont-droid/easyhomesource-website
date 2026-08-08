import { NextResponse } from "next/server";
import { calculatePropertyStats } from "@/lib/db/propertyStore";

export async function GET() {
  try {
    const stats = calculatePropertyStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Failed to compute property stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute statistics." },
      { status: 500 }
    );
  }
}
