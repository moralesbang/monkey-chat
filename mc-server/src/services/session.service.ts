import { getScenarioById } from "../data/scenarios";
import { sessionStore } from "../store/sessionStore";
import type { ConversationState, SessionSummary } from "../types";
import { ProspectAgent } from "../workflows/prospectAgent";

const prospectAgent = new ProspectAgent();

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

    // Add user message
    state.messages.push({
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    });

    // Generate prospect response
    const prospectResponse = await prospectAgent.generateResponse(
      state,
      userMessage
    );

    // Add prospect response
    state.messages.push({
      role: "assistant",
      content: prospectResponse,
      timestamp: new Date(),
    });

    // Analyze conversation
    const analysis = await prospectAgent.analyzeConversation(state);

    // Update state based on analysis
    if (analysis.newPhase) state.phase = analysis.newPhase as any;
    if (analysis.newMood) state.prospectMood = analysis.newMood;
    if (analysis.performanceNote)
      state.performanceNotes.push(analysis.performanceNote);
    if (
      analysis.keyTopic &&
      !state.keyTopicsDiscussed.includes(analysis.keyTopic)
    ) {
      state.keyTopicsDiscussed.push(analysis.keyTopic);
    }
    if (analysis.objection) state.objectionsRaised.push(analysis.objection);

    // Save updated state
    sessionStore.set(sessionId, state);

    return { state, prospectResponse };
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
    const summaryData = await prospectAgent.generateSummary(state);

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
