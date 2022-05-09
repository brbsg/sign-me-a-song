import supertest from "supertest";
import app from "../../src/app";
import { v4 as uuid } from "uuid";
import { prisma } from "../../src/database";
import {
  insertRecommendation,
  recommendationFactory,
} from "../factories/recommendationFactory";
import faker from "@faker-js/faker";

const agent = supertest(app);

describe("POST recommendations", () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 201 when inserting a new recommendation", async () => {
    const recommendation = recommendationFactory();

    const response = await agent.post("/recommendations/").send(recommendation);

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
    const dbRecommendation = await insertRecommendation();
    const { id } = dbRecommendation;

    for (let i = 0; i <= 6; i++) {
      await supertest(app).post(`/recommendations/${id}/downvote`);
    }

    const dbRecommendationTest = await prisma.recommendation.findFirst({
      where: { id },
    });

    expect(dbRecommendationTest).toBeNull();
  });
});

describe("GET /recommendations", () => {
  it("should return the last 10 recommendations in descending order", async () => {
    const response = await supertest(app).get("/recommendations");

    const firstRecommendation = response.body[0];
    const secondRecommendation = response.body[1];

    expect(secondRecommendation.id).toBeLessThan(firstRecommendation.id);
  });
});

describe("GET /recommendations/:id", () => {
  it("should return recommendation given valid id", async () => {
    const dbRecommendation = await insertRecommendation();
    const { id } = dbRecommendation;

    const response = await supertest(app).get(`/recommendations/${id}`);
    const returnedRecommendation = response.body;

    expect(returnedRecommendation).toMatchObject(dbRecommendation);
  });
});

describe("GET /recommendations/random", () => {
  it("should return a recommendation", async () => {
    const response = await supertest(app).get("/recommendations/random");

    console.log(response.body);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("id");
  });
});

describe("GET /recommendations/top/:amount", () => {
  it("should return the top x musics ordered by score", async () => {
    const amount = faker.datatype.number({ min: 2, max: 4 });

    const response = await supertest(app).get(`/recommendations/top/${amount}`);

    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(amount);
    expect(response.body[0].score).toBeGreaterThanOrEqual(
      response.body[1].score
    );
  });
});
