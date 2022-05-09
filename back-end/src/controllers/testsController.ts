import { Request, Response } from "express";
import { recommendationFactory } from "../../tests/factories/recommendationFactory.js";
import { prisma } from "../database.js";

export async function resetDatabase(req: Request, res: Response) {
  try {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(422);
  }
}

export async function seedDatabase(req: Request, res: Response) {
  const data = Array.from({ length: 20 }).map(() => recommendationFactory());

  try {
    await prisma.recommendation.createMany({ data });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(422);
  }
}
