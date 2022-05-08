import supertest from "supertest";
import app from "../src/app";
import { v4 as uuid } from "uuid";
import { prisma } from "../src/database";
import { recommendationFactory } from "./factories/recommendationFactory";

const agent = supertest(app);

describe("Recommendation General", () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST recommendations", () => {
    it("should return 201 when inserting a new recommendation", async () => {
      const recommendation = recommendationFactory();

      const response = await agent
        .post("/recommendations/")
        .send(recommendation);

      const dbRecommendation = await prisma.recommendation.findUnique({
        where: { name: recommendation.name },
      });

      expect(response.status).toEqual(201);
      expect(recommendation.name).toEqual(dbRecommendation.name);
    });

    it("should return 422 when inserting a wrong recommendation schema", async () => {
      const recommendation = {
        name: "uuid()",
        youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
      };

      for (let key in recommendation) {
        const badRecommendation = { ...recommendation };

        badRecommendation[key] =
          typeof badRecommendation[key] === "string" ? 15 : "banana";

        const response = await agent
          .post("/recommendations/")
          .send(badRecommendation);

        expect(response.status).toEqual(422);
      }
    });
  });

  describe("POST /recommendations/:id/upvote", () => {
    it("should add one unit to recommendation score and persist", () => {});
  });
});
