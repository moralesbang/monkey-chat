import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "../services/llm.service";
import type { ConversationState, Message } from "../types";

// Define the state for our LangGraph workflow
const ProspectGraphState = Annotation.Root({
  // Core conversation state
  sessionId: Annotation<string>,
  scenario: Annotation<any>,
  messages: Annotation<Message[]>,
  phase: Annotation<
    "opening" | "discovery" | "objection_handling" | "closing" | "ended"
  >,
  prospectMood: Annotation<string>,
  keyTopicsDiscussed: Annotation<string[]>,
  objectionsRaised: Annotation<string[]>,
  performanceNotes: Annotation<string[]>,
  startedAt: Annotation<Date>,
  endedAt: Annotation<Date | undefined>,

  // Workflow-specific fields
  currentUserMessage: Annotation<string>,
  prospectResponse: Annotation<string>,
  analysisResult: Annotation<
    | {
        newPhase?: string;
        newMood?: string;
        performanceNote?: string;
        keyTopic?: string;
        objection?: string;
      }
    | undefined
  >,
});

export class ProspectAgentGraph {
  private llm = createLLM();
  private graph;

  constructor() {
    this.graph = this.buildGraph();
  }

  private buildSystemPrompt(state: typeof ProspectGraphState.State): string {
    const { scenario, prospectMood, phase, keyTopicsDiscussed } = state;

    return `You are ${scenario.prospectName}, ${scenario.prospectRole} at ${
      scenario.company
    }.

    COMPANY CONTEXT:
    - Industry: ${scenario.industry}
    - Company Size: ${scenario.companySize}
    - Background: ${scenario.background}

    YOUR PAIN POINTS:
    ${scenario.painPoints.map((p: string) => `- ${p}`).join("\n")}

    CURRENT STATE:
    - Your mood: ${prospectMood}
    - Conversation phase: ${phase}
    - Topics discussed: ${keyTopicsDiscussed.join(", ") || "none yet"}

    BEHAVIOR GUIDELINES:
    1. Stay in character at all times
    2. Be realistic - don't make it too easy for the salesperson
    3. Ask challenging questions about ROI, implementation, and pricing
    4. Show skepticism when appropriate, especially early in the conversation
    5. Gradually warm up if the salesperson asks good discovery questions
    6. Raise objections naturally based on your pain points
    7. Don't volunteer information - make them ask good questions
    8. Keep responses concise (2-3 sentences typical, 4-5 max)
    9. Be professional but authentic to your role

    MOOD ADJUSTMENTS:
    - Skeptical: Be brief, questioning, need strong proof
    - Neutral: Professional, open to hearing more
    - Interested: Ask deeper questions, share more context
    - Defensive: Push back on claims, need reassurance

    Remember: You're a busy executive. Your time is valuable. The salesperson needs to earn your engagement.`;
  }

  // Node 1: Add user message to state
  private async addUserMessage(state: typeof ProspectGraphState.State) {
    const newMessage: Message = {
      role: "user",
      content: state.currentUserMessage,
      timestamp: new Date(),
    };

    return {
      messages: [...state.messages, newMessage],
    };
  }

  // Node 2: Generate prospect response
  private async generateResponse(state: typeof ProspectGraphState.State) {
    const systemPrompt = this.buildSystemPrompt(state);

    // Build conversation history
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...state.messages.slice(-6).map((m) => ({
        // Keep last 6 messages for context
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
      { role: "user" as const, content: state.currentUserMessage },
    ];

    const response = await this.llm.invoke(messages);
    const prospectResponse = response.content as string;

    return {
      prospectResponse,
    };
  }

  // Node 3: Add prospect response to state
  private async addProspectResponse(state: typeof ProspectGraphState.State) {
    const newMessage: Message = {
      role: "assistant",
      content: state.prospectResponse,
      timestamp: new Date(),
    };

    return {
      messages: [...state.messages, newMessage],
    };
  }

  // Node 4: Analyze conversation
  private async analyzeConversation(state: typeof ProspectGraphState.State) {
    const lastUserMessage =
      state.messages
        .slice()
        .reverse()
        .find((m) => m.role === "user")
        ?.content.toLowerCase() || "";

    const analysis: any = {};

    // Detect phase transitions
    if (state.messages.length <= 2) {
      analysis.newPhase = "opening";
    } else if (
      lastUserMessage.includes("challenge") ||
      lastUserMessage.includes("concern")
    ) {
      analysis.newPhase = "objection_handling";
    } else if (
      lastUserMessage.includes("next step") ||
      lastUserMessage.includes("demo") ||
      lastUserMessage.includes("trial")
    ) {
      analysis.newPhase = "closing";
    } else if (
      lastUserMessage.includes("tell me") ||
      lastUserMessage.includes("what") ||
      lastUserMessage.includes("how")
    ) {
      analysis.newPhase = "discovery";
    }

    // Detect good discovery questions
    const discoveryKeywords = [
      "why",
      "what",
      "how",
      "tell me about",
      "walk me through",
      "help me understand",
    ];
    if (
      discoveryKeywords.some((keyword) => lastUserMessage.includes(keyword))
    ) {
      analysis.performanceNote = "Asked good discovery question";
      analysis.newMood =
        state.prospectMood === "skeptical"
          ? "neutral"
          : state.prospectMood === "neutral"
          ? "interested"
          : "interested";
    }

    // Detect if user is talking too much (message too long)
    if (lastUserMessage.split(" ").length > 100) {
      analysis.performanceNote =
        "Message too long - let the prospect talk more";
    }

    // Detect key topics
    const topics = [
      "price",
      "pricing",
      "cost",
      "roi",
      "implementation",
      "timeline",
      "integration",
      "security",
      "support",
    ];
    for (const topic of topics) {
      if (lastUserMessage.includes(topic)) {
        analysis.keyTopic = topic;
        break;
      }
    }

    return {
      analysisResult: analysis,
    };
  }

  // Node 5: Update state based on analysis
  private async updateStateFromAnalysis(
    state: typeof ProspectGraphState.State
  ) {
    const analysis = state.analysisResult || {};
    const updates: any = {};

    if (analysis.newPhase) {
      updates.phase = analysis.newPhase;
    }

    if (analysis.newMood) {
      updates.prospectMood = analysis.newMood;
    }

    if (analysis.performanceNote) {
      updates.performanceNotes = [
        ...state.performanceNotes,
        analysis.performanceNote,
      ];
    }

    if (
      analysis.keyTopic &&
      !state.keyTopicsDiscussed.includes(analysis.keyTopic)
    ) {
      updates.keyTopicsDiscussed = [
        ...state.keyTopicsDiscussed,
        analysis.keyTopic,
      ];
    }

    if (analysis.objection) {
      updates.objectionsRaised = [
        ...state.objectionsRaised,
        analysis.objection,
      ];
    }

    return updates;
  }

  private buildGraph() {
    const workflow = new StateGraph(ProspectGraphState)
      // Add nodes
      .addNode("addUserMessage", this.addUserMessage.bind(this))
      .addNode("generateResponse", this.generateResponse.bind(this))
      .addNode("addProspectResponse", this.addProspectResponse.bind(this))
      .addNode("analyzeConversation", this.analyzeConversation.bind(this))
      .addNode("updateState", this.updateStateFromAnalysis.bind(this))

      // Define edges (linear flow)
      .addEdge("__start__", "addUserMessage")
      .addEdge("addUserMessage", "generateResponse")
      .addEdge("generateResponse", "addProspectResponse")
      .addEdge("addProspectResponse", "analyzeConversation")
      .addEdge("analyzeConversation", "updateState")
      .addEdge("updateState", "__end__");

    return workflow.compile();
  }

  async processMessage(
    state: ConversationState,
    userMessage: string
  ): Promise<{
    updatedState: ConversationState;
    prospectResponse: string;
  }> {
    // Prepare initial state for LangGraph
    const graphState: typeof ProspectGraphState.State = {
      ...state,
      currentUserMessage: userMessage,
      prospectResponse: "",
      analysisResult: undefined,
    };

    // Run the graph
    const result = await this.graph.invoke(graphState);

    // Extract updated state
    const updatedState: ConversationState = {
      sessionId: result.sessionId,
      scenario: result.scenario,
      messages: result.messages,
      phase: result.phase,
      prospectMood: result.prospectMood,
      keyTopicsDiscussed: result.keyTopicsDiscussed,
      objectionsRaised: result.objectionsRaised,
      performanceNotes: result.performanceNotes,
      startedAt: result.startedAt,
      endedAt: result.endedAt,
    };

    return {
      updatedState,
      prospectResponse: result.prospectResponse,
    };
  }

  async generateSummary(state: ConversationState): Promise<any> {
    const duration = state.endedAt
      ? Math.floor((state.endedAt.getTime() - state.startedAt.getTime()) / 1000)
      : 0;

    const summaryPrompt = `Analyze this sales conversation and provide feedback.

      SCENARIO: ${state.scenario.title}
      MESSAGES: ${state.messages.length}
      DURATION: ${duration} seconds
      KEY TOPICS: ${state.keyTopicsDiscussed.join(", ")}
      OBJECTIONS RAISED: ${state.objectionsRaised.join(", ")}

      CONVERSATION:
      ${state.messages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n")}

      Provide a JSON response with:
      {
        "keyMoments": ["moment 1", "moment 2", "moment 3"],
        "strengths": ["strength 1", "strength 2"],
        "areasForImprovement": ["area 1", "area 2"],
        "overallFeedback": "2-3 sentence summary"
      }
    `;

    const response = await this.llm.invoke([
      { role: "user", content: summaryPrompt },
    ]);

    try {
      // Try to parse JSON from response
      const content = response.content as string;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse summary JSON:", e);
    }

    // Fallback
    return {
      keyMoments: ["Conversation completed"],
      strengths: ["Engaged with the prospect"],
      areasForImprovement: ["Continue practicing"],
      overallFeedback: "Good effort in this practice session.",
    };
  }
}
