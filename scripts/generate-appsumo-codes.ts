import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}

async function main() {
  const tier = parseInt(process.argv[2] || "1");
  const count = parseInt(process.argv[3] || "100");

  if (![1, 2, 3].includes(tier)) {
    console.error("Tier must be 1, 2, or 3");
    process.exit(1);
  }

  console.log(`Generating ${count} codes for Tier ${tier}...`);

  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = generateCode();
    await prisma.appSumoLicense.create({
      data: { code, tier },
    });
    codes.push(code);
  }

  console.log(`Generated ${codes.length} codes:`);
  codes.forEach((c) => console.log(c));

  const filename = `appsumo-codes-tier${tier}-${Date.now()}.txt`;
  const fs = await import("fs");
  fs.writeFileSync(filename, codes.join("\n"));
  console.log(`\nSaved to ${filename}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
