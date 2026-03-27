import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { createLink, getLinks } from "@/modules/links";
import { checkLinksPerDoc } from "@/lib/plan-check";
import { logAudit } from "@/modules/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const planCheck = await checkLinksPerDoc(session.user.orgId, id);
    if (!planCheck.allowed) {
      return NextResponse.json(
        { error: planCheck.message, upgrade: true },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const link = await createLink(session.user.orgId, id, body.name);

    logAudit(session.user.orgId, session.user.id, "link.created", "link", link.id);

    return NextResponse.json({ success: true, link }, { status: 201 });
  } catch (error) {
    console.error("Create link error:", error);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const links = await getLinks(session.user.orgId, id);
    return NextResponse.json({ links });
  } catch (error) {
    console.error("List links error:", error);
    return NextResponse.json({ error: "Failed to list links" }, { status: 500 });
  }
}
