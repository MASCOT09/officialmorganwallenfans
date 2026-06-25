import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
  return NextResponse.json({ publicKey });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const endpoint = body.endpoint as string;
  const keys = body.keys as { p256dh: string; auth: string };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const repo = getRepository();
  const existing = await repo.getPushSubscriptions(session.id);
  const match = existing.find((s) => s.endpoint === endpoint);
  if (match) return NextResponse.json({ ok: true });

  await repo.createPushSubscription({
    id: uuidv4(),
    user_id: session.id,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await request.json();
  if (endpoint) {
    await getRepository().deletePushSubscriptionByEndpoint(endpoint);
  }
  return NextResponse.json({ ok: true });
}
