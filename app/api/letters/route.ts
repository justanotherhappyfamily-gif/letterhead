import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const snapshot = await db
      .collection("letterheads")
      .orderBy("updatedAt", "desc")
      .limit(100)
      .get();

    const letters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, letters });
  } catch (error: any) {
    console.error("Error fetching letters:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch letters" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, refNo, date, recipient, subject, bodyText, includeSignature, category } = body;

    const db = getDb();
    const now = new Date().toISOString();

    const letterData = {
      refNo: refNo || "",
      date: date || "",
      recipient: recipient || "",
      subject: subject || "",
      bodyText: bodyText || "",
      includeSignature: includeSignature !== false,
      category: category || "GENERAL",
      updatedAt: now,
    };

    if (id) {
      // Update existing
      await db.collection("letterheads").doc(id).set(letterData, { merge: true });
      return NextResponse.json({
        success: true,
        letter: { id, ...letterData },
        message: "Letter updated successfully",
      });
    } else {
      // Create new
      const docRef = await db.collection("letterheads").add({
        ...letterData,
        createdAt: now,
      });
      return NextResponse.json({
        success: true,
        letter: { id: docRef.id, ...letterData, createdAt: now },
        message: "Letter created successfully",
      });
    }
  } catch (error: any) {
    console.error("Error saving letter:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save letter" },
      { status: 500 }
    );
  }
}
