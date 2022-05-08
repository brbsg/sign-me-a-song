import { CreateRecommendationData } from "../../src/services/recommendationsService";
import { faker } from "@faker-js/faker";

export function recommendationFactory(): CreateRecommendationData {
  return {
    name: `${faker.music.genre()} ${faker.internet.password()}`,
    youtubeLink: "https://www.youtube.com/watch?v=iuvnaext7EU",
  };
}
