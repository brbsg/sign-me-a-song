import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { recommendationService } from "../../src/services/recommendationsService";
import { dbRecommendationFactory } from "../factories/recommendationFactory";
import { jest } from "@jest/globals";

describe("recommendationService upvote", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("should throw error if no recommendation is found", async () => {
    jest.spyOn(recommendationRepository, "find").mockReturnValue(null);

    expect(async () => {
      await recommendationService.upvote(1);
    }).rejects.toEqual({
      message: "",
      type: "not_found",
    });
  });
});

describe("recommendationService downvote", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("should delete recommendation after six downvotes", async () => {
    const recommendation = dbRecommendationFactory();

    jest
      .spyOn(recommendationRepository, "find")
      .mockResolvedValue(recommendation);
    jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue();

    const remove = jest
      .spyOn(recommendationRepository, "remove")
      .mockResolvedValue(null);

    await recommendationService.downvote(1);

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("should throw error if no recommendation is found", async () => {
    jest.spyOn(recommendationRepository, "find").mockReturnValue(null);

    expect(async () => {
      await recommendationService.downvote(1);
    }).rejects.toEqual({
      message: "",
      type: "not_found",
    });
  });
});

describe("unit recommendationService getByScore", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("should return all recommendations", async () => {
    const recommendation = dbRecommendationFactory();
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValue([recommendation]);

    const result = await recommendationService.getByScore("gt");

    expect(result).toEqual([recommendation]);
  });

  it("should call findAll if filter returns null", async () => {
    const result = jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValue([]);

    await recommendationService.getByScore("gt");

    expect(result).toHaveBeenCalledTimes(2);
  });

  it("should call findAll filtered with valid scoreFilter less than or equal(lte)", async () => {
    const result = jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValue([]);

    await recommendationService.getByScore("lte");

    expect(result).toBeCalledWith({ score: 10, scoreFilter: "lte" });
  });

  it("should throw error if no recommendation is found", async () => {
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);

    expect(async () => {
      await recommendationService.getRandom();
    }).rejects.toEqual({
      message: "",
      type: "not_found",
    });
  });
});

describe("recommendationService getScoreFilter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("should return lte if value is higher than 0.7", async () => {
    const result = recommendationService.getScoreFilter(0.8);

    expect(result).toBe("lte");
  });

  it("should return gt if value is lower than 0.7", async () => {
    const result = recommendationService.getScoreFilter(0.6);

    expect(result).toBe("gt");
  });
});

describe("recommendationService random", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("should throw error if recommendation is not found", async () => {
    jest.spyOn(recommendationService, "getScoreFilter").mockReturnValue("gt");
    jest.spyOn(recommendationService, "getByScore").mockResolvedValue([]);
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);

    expect(async () => {
      await recommendationService.getRandom();
    }).rejects.toEqual({
      message: "",
      type: "not_found",
    });
  });
});
