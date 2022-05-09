import { Router } from "express";
import { resetDatabase, seedDatabase } from "../controllers/testsController.js";

const testsRouter = Router();

testsRouter.post("/reset-database", resetDatabase);
testsRouter.post("/seed-database", seedDatabase);

export default testsRouter;
