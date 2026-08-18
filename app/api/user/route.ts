import { NextResponse } from "next/server";
import { inngestErrorMessage, sendEvent } from "@/app/lib/send-event";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const user = { id: `user-${Date.now()}`, email, name };

    try {
      const ids = await sendEvent("user/registered", {
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      return NextResponse.json({ success: true, user, ids });
    } catch (error) {
      return NextResponse.json(
        { success: true, user, warning: inngestErrorMessage(error) },
        { status: 200 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
