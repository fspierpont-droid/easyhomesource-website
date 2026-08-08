import { NextResponse } from "next/server";
import {
  getAllProperties,
  createProperty,
  getPublicProperties
} from "@/lib/db/propertyStore";
import type { PropertyStatus, PropertyType } from "@/types/property";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status") as PropertyStatus | null;
    const propertyType = searchParams.get("propertyType") as PropertyType | null;
    const county = searchParams.get("county");
    const builder = searchParams.get("builder");
    const publicOnly = searchParams.get("publicOnly") === "true";
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let list = publicOnly ? getPublicProperties() : getAllProperties();

    // Text search across address, parcel, city, builder, notes
    if (search) {
      list = list.filter((p) => {
        const text = [
          p.address,
          p.city,
          p.county,
          p.zip,
          p.parcelNumber,
          p.builder,
          p.community,
          p.notes,
          p.internalNotes,
          p.salesperson
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(search);
      });
    }

    // Status filter
    if (status && status !== "ALL" as any) {
      list = list.filter((p) => p.status === status);
    }

    // Property Type filter
    if (propertyType && propertyType !== "ALL" as any) {
      list = list.filter((p) => p.propertyType === propertyType);
    }

    // County filter
    if (county && county !== "ALL") {
      list = list.filter((p) => p.county.toLowerCase() === county.toLowerCase());
    }

    // Builder filter
    if (builder && builder !== "ALL") {
      list = list.filter((p) => (p.builder || "").toLowerCase().includes(builder.toLowerCase()));
    }

    // Sorting
    list.sort((a, b) => {
      let aVal: any = (a as any)[sortBy];
      let bVal: any = (b as any)[sortBy];

      if (sortBy === "price") {
        aVal = a.price ?? -1;
        bVal = b.price ?? -1;
      }

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return NextResponse.json({
      success: true,
      count: list.length,
      properties: list
    });
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.address || !body.city) {
      return NextResponse.json(
        { success: false, error: "Address and City are required fields." },
        { status: 400 }
      );
    }

    const created = createProperty(body, body.user || "Portal User");
    return NextResponse.json({
      success: true,
      message: "Property created successfully in Property Center.",
      property: created
    });
  } catch (error) {
    console.error("Failed to create property:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create property" },
      { status: 500 }
    );
  }
}
