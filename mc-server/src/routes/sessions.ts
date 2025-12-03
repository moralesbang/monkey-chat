import { Router } from "express";
import { SessionService } from "../services/session.service";

const router = Router();
const sessionService = new SessionService();

// Create a new session
router.post("/start", async (req, res) => {
  try {
    const { scenarioId } = req.body;

    if (!scenarioId) {
      return res.status(400).json({ error: "scenarioId is required" });
    }

    const state = await sessionService.createSession(scenarioId);

    res.json({
      sessionId: state.sessionId,
      scenario: state.scenario,
      initialContext: {
        prospectName: state.scenario.prospectName,
        prospectRole: state.scenario.prospectRole,
        company: state.scenario.company,
        mood: state.prospectMood,
      },
    });
  } catch (error: any) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post("/:sessionId/message", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const result = await sessionService.sendMessage(sessionId, message);

    res.json({
      prospectResponse: result.prospectResponse,
      phase: result.state.phase,
      mood: result.state.prospectMood,
      keyTopics: result.state.keyTopicsDiscussed,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: error.message });
  }
});

// End session and get summary
router.post("/:sessionId/end", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const summary = await sessionService.endSession(sessionId);
    res.json(summary);
  } catch (error: any) {
    console.error("Error ending session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get session state
router.get("/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const state = sessionService.getSession(sessionId);

    if (!state) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(state);
  } catch (error: any) {
    console.error("Error getting session:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
