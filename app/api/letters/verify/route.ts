import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const refNoParam = url.searchParams.get("refNo");

    if (!refNoParam || !refNoParam.trim()) {
      return NextResponse.json(
        { success: false, error: "Reference number query parameter (refNo) is required" },
        { status: 400 }
      );
    }

    const searchRefNo = refNoParam.trim().toUpperCase();
    const db = getDb();

    // Query Firestore for matching refNo
    const snapshot = await db
      .collection("letterheads")
      .where("refNo", "==", searchRefNo)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // Also check case-insensitive fallback by looking up recent letters if exact uppercase didn't match
      const fallbackSnapshot = await db
        .collection("letterheads")
        .orderBy("updatedAt", "desc")
        .limit(100)
        .get();

      const matchedDoc = fallbackSnapshot.docs.find(
        (d) => String(d.data().refNo || "").trim().toUpperCase() === searchRefNo
      );

      if (!matchedDoc) {
        return NextResponse.json({
          success: true,
          found: false,
          refNo: searchRefNo,
          message: `Reference number "${searchRefNo}" was not found in the official database registry.`,
        });
      }

      const data = matchedDoc.data();
      return NextResponse.json({
        success: true,
        found: true,
        refNo: searchRefNo,
        letter: {
          id: matchedDoc.id,
          refNo: data.refNo,
          date: data.date,
          recipient: data.recipient,
          subject: data.subject,
          bodyText: data.bodyText,
          category: data.category || "GENERAL",
          includeSignature: data.includeSignature !== false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        message: `Official Authenticated Letterhead verified successfully.`,
      });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return NextResponse.json({
      success: true,
      found: true,
      refNo: searchRefNo,
      letter: {
        id: doc.id,
        refNo: data.refNo,
        date: data.date,
        recipient: data.recipient,
        subject: data.subject,
        bodyText: data.bodyText,
        category: data.category || "GENERAL",
        includeSignature: data.includeSignature !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      message: `Official Authenticated Letterhead verified successfully.`,
    });
  } catch (error: any) {
    console.error("Error verifying reference number:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify reference number against database",
      },
      { status: 500 }
    );
  }
}
