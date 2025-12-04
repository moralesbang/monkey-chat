import { getScenarioById } from "../data/scenarios";
import { sessionStore } from "../store/sessionStore";
import type { ConversationState, SessionSummary } from "../types";
import { ProspectAgentGraph } from "../workflows/prospectAgentGraph";

const prospectAgentGraph = new ProspectAgentGraph();

export class SessionService {
  async createSession(scenarioId: string): Promise<ConversationState> {
    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    const sessionId = crypto.randomUUID();

    const initialState: ConversationState = {
      sessionId,
      scenario,
      messages: [],
      phase: "opening",
      prospectMood: scenario.initialMood,
      keyTopicsDiscussed: [],
      objectionsRaised: [],
      performanceNotes: [],
      startedAt: new Date(),
    };

    sessionStore.set(sessionId, initialState);
    return initialState;
  }

  async sendMessage(
    sessionId: string,
    userMessage: string
  ): Promise<{
    state: ConversationState;
    prospectResponse: string;
  }> {
    const state = sessionStore.get(sessionId);
    if (!state) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Process message through LangGraph workflow
    const result = await prospectAgentGraph.processMessage(state, userMessage);

    // Save updated state
    sessionStore.set(sessionId, result.updatedState);

    return {
      state: result.updatedState,
      prospectResponse: result.prospectResponse,
    };
  }

  async endSession(sessionId: string): Promise<SessionSummary> {
    const state = sessionStore.get(sessionId);
    if (!state) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    state.endedAt = new Date();
    state.phase = "ended";
    sessionStore.set(sessionId, state);

    // Generate summary
    const summaryData = await prospectAgentGraph.generateSummary(state);

    const duration = Math.floor(
      (state.endedAt.getTime() - state.startedAt.getTime()) / 1000
    );

    const summary: SessionSummary = {
      sessionId,
      duration,
      messageCount: state.messages.length,
      ...summaryData,
    };

    return summary;
  }

  getSession(sessionId: string): ConversationState | undefined {
    return sessionStore.get(sessionId);
  }
}
