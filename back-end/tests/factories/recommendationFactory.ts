import { CreateRecommendationData } from "../../src/services/recommendationsService.js";
import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database.js";
import { v4 as uuid } from "uuid";
import { Recommendation } from "@prisma/client";

export function recommendationFactory(): CreateRecommendationData {
  return {
    name: `${faker.music.genre()} ${uuid()}`,
    youtubeLink: "https://www.youtube.com/watch?v=iuvnaext7EU",
  };
}

export function dbRecommendationFactory(): Recommendation {
  return {
    id: 1,
    name: faker.name.findName(),
    youtubeLink: faker.internet.url(),
    score: -6,
  };
}

export async function insertRecommendation() {
  const data = recommendationFactory();

  const dbRecommendation = await prisma.recommendation.create({
    data,
  });

  return dbRecommendation;
}
