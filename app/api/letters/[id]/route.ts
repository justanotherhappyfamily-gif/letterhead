import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const doc = await db.collection("letterheads").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Letter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      letter: { id: doc.id, ...doc.data() },
    });
  } catch (error: any) {
    console.error("Error fetching letter:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch letter" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    await db.collection("letterheads").doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "Letter deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting letter:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete letter" },
      { status: 500 }
    );
  }
}
