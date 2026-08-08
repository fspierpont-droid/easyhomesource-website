import { NextResponse } from "next/server";
import {
  getPropertyById,
  updateProperty,
  deleteProperty
} from "@/lib/db/propertyStore";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const property = getPropertyById(params.id);
    if (!property) {
      return NextResponse.json(
        { success: false, error: `Property ${params.id} not found.` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, property });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const user = body._user || "Portal User";
    delete body._user;

    const updated = updateProperty(params.id, body, user);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Property ${params.id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Property updated successfully.",
      property: updated
    });
  } catch (error) {
    console.error(`Failed to update property ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update property." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteProperty(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Property ${params.id} not found.` },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `Property ${params.id} removed from Property Center.`
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete property." },
      { status: 500 }
    );
  }
}
