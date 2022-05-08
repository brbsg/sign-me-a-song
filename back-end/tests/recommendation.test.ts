import supertest from "supertest";
import app from "../src/app";
import { v4 as uuid } from "uuid";
import { prisma } from "../src/database";
import {
  insertRecommendation,
  recommendationFactory,
} from "./factories/recommendationFactory";

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
    it("should add one unit to recommendation score and persist", async () => {
      const dbRecommendation = await insertRecommendation();

      const { id } = dbRecommendation;

      await agent.post(`/recommendations/${id}/upvote`);

      const updatedDbRecommendation = await prisma.recommendation.findUnique({
        where: { name: dbRecommendation.name },
        select: { score: true },
      });

      const { score } = updatedDbRecommendation;

      expect(score).toEqual(1);
    });
  });

  describe("POST /recommendations/:id/downvote", () => {
    it("should subtract one unit to recommendation score and persist", async () => {
      const dbRecommendation = await insertRecommendation();

      const { id } = dbRecommendation;

      await agent.post(`/recommendations/${id}/downvote`);

      const updatedDbRecommendation = await prisma.recommendation.findUnique({
        where: { name: dbRecommendation.name },
        select: { score: true },
      });

      const { score } = updatedDbRecommendation;

      expect(score).toEqual(-1);
    });

    it("should delete recommendation after six downvotes", async () => {
      const persistedRecommendation = await insertRecommendation();
      const { id } = persistedRecommendation;

      for (let i = 0; i <= 6; i++) {
        console.log(i);

        await supertest(app).post(`/recommendations/${id}/downvote`);
      }

      const dbRecommendation = await prisma.recommendation.findFirst({
        where: { id },
      });

      expect(dbRecommendation).toBeNull();
    });
  });
});
