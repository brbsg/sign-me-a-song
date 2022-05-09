describe("Check pages", () => {
  beforeEach(cy.clearDatabase);
  afterEach(cy.clearDatabase);

  it("should go to the home page ", () => {
    cy.visit("/");

    cy.contains("Home").click();

    cy.url().should("equal", Cypress.config().baseUrl + "/");

    cy.end();
  });

  it("should go to the top page", () => {
    cy.visit("/");

    cy.contains("Top").click();

    cy.url().should("equal", Cypress.config().baseUrl + "/top");

    cy.end();
  });

  it("shouldgo to the  random page ", () => {
    cy.visit("/");

    cy.contains("Random").click();

    cy.url().should("equal", Cypress.config().baseUrl + "/random");

    cy.end();
  });
});

describe("test video player in each page", () => {
  beforeEach(cy.seedDatabase);
  afterEach(cy.clearDatabase);

  it("should show video player in home page", () => {
    cy.visit("/");

    cy.get("article")
      .first()
      .find("iframe")
      .should("be.visible")
      .should("not.be.undefined")
      .end();
  });

  it("should show video player in top page", () => {
    cy.visit("/top");

    cy.get("article")
      .first()
      .find("iframe")
      .should("be.visible")
      .should("not.be.undefined")
      .end();
  });

  it("should show video player in random page", () => {
    cy.visit("/random");

    cy.get("article")
      .first()
      .find("iframe")
      .should("be.visible")
      .should("not.be.undefined")
      .end();
  });
});

describe("interactions with the interface", () => {
  beforeEach(cy.seedDatabase);

  it("should increase one unit in like count", () => {
    cy.visit("/");
    cy.get("article").first().find("svg").first().click();

    cy.contains(1).should("not.be.undefined");

    cy.end();
  });
  it("should decrease one unit in like count", () => {
    cy.visit("/");
    cy.get("article").first().find("svg").last().click();

    cy.contains(-1).should("not.be.undefined");

    cy.end();
  });
});
