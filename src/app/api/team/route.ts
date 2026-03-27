import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { getOrgMembers, inviteMember } from "@/modules/orgs";
import { checkPlanLimit } from "@/lib/plan-check";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const members = await getOrgMembers(session.user.orgId);
    return NextResponse.json({ members });
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json({ error: "Failed to get members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only OWNER and ADMIN can invite
    if (!["OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const planCheck = await checkPlanLimit(session.user.orgId, "members");
    if (!planCheck.allowed) {
      return NextResponse.json(
        { error: planCheck.message, upgrade: true },
        { status: 403 },
      );
    }

    const { email, role } = await req.json();
    if (!email || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json({ error: "Invalid email or role" }, { status: 400 });
    }

    const membership = await inviteMember(
      session.user.orgId,
      email,
      role,
      session.user.name || session.user.email || "Someone"
    );

    return NextResponse.json({ success: true, membership }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to invite";
    console.error("Invite error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
