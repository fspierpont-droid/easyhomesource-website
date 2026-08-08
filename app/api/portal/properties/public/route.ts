import { NextResponse } from "next/server";
import { getPublicProperties } from "@/lib/db/propertyStore";

export async function GET() {
  try {
    const publicProperties = getPublicProperties();
    return NextResponse.json({
      success: true,
      count: publicProperties.length,
      properties: publicProperties
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch public property inventory" },
      { status: 500 }
    );
  }
}
