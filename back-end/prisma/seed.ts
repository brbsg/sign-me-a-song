import { prisma } from "../src/database.js";
import { recommendationFactory } from "../tests/factories/recommendationFactory.js";

async function main() {
  const data = Array.from({ length: 20 }).map(() => recommendationFactory());

  await prisma.recommendation.createMany({ data });
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
