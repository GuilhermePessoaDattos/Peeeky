import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";

// List templates
export async function GET() {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.signatureTemplate.findMany({
    where: { orgId: session.user.orgId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(templates);
}

// Create template
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, fields } = await req.json();
  if (!name || !Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json({ error: "name and fields[] required" }, { status: 400 });
  }

  const template = await prisma.signatureTemplate.create({
    data: {
      orgId: session.user.orgId,
      name,
      fields,
    },
  });

  return NextResponse.json(template);
}

// Delete template
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await req.json();

  const template = await prisma.signatureTemplate.findFirst({
    where: { id: templateId, orgId: session.user.orgId },
  });
  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.signatureTemplate.delete({ where: { id: templateId } });
  return NextResponse.json({ ok: true });
}
