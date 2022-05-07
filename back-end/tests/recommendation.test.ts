import supertest from "supertest";
import app from "../src/app";
import { v4 as uuid } from "uuid";
import { prisma } from "../src/database";

describe("POST recommendations", () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 201 when inserting a new recommendation", async () => {
    const recommendation = {
      name: "Falamansa - Xote dos Milagresdd" + uuid(),
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
    };

    const response = await supertest(app)
      .post("/recommendations/")
      .send(recommendation);

    expect(response.status).toEqual(201);
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

      const response = await supertest(app)
        .post("/recommendations/")
        .send(badRecommendation);

      expect(response.status).toEqual(422);
    }
  });
});
