import { Router } from "express";
import { scenarios } from "../data/scenarios";

const router = Router();

router.get("/", (_req, res) => {
  res.json(scenarios);
});

router.get("/:id", (req, res) => {
  const scenario = scenarios.find((item) => item.id === req.params.id);
  if (!scenario) {
    return res.status(404).json({ error: "Scenario not found" });
  }
  res.json(scenario);
});

export default router;
