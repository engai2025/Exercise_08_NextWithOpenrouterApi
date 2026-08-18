import { NextResponse } from "next/server";
import { inngestErrorMessage, sendEvent } from "@/app/lib/send-event";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const data = body?.data ?? {};

    if (!name) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    try {
      const ids = await sendEvent(name, data);
      return NextResponse.json({
        success: true,
        event: { name, data },
        ids,
      });
    } catch (error) {
      return NextResponse.json(
        { error: inngestErrorMessage(error) },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
