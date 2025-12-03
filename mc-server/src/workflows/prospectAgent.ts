import { createLLM } from "../services/llm.service";
import type { ConversationState } from "../types";

export class ProspectAgent {
  private llm = createLLM();

  private buildSystemPrompt(state: ConversationState): string {
    const { scenario, prospectMood, phase, keyTopicsDiscussed } = state;

    return `You are ${scenario.prospectName}, ${scenario.prospectRole} at ${
      scenario.company
    }.

    COMPANY CONTEXT:
    - Industry: ${scenario.industry}
    - Company Size: ${scenario.companySize}
    - Background: ${scenario.background}

    YOUR PAIN POINTS:
    ${scenario.painPoints.map((p) => `- ${p}`).join("\n")}

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

  async generateResponse(
    state: ConversationState,
    userMessage: string
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(state);

    // Build conversation history
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...state.messages.slice(-6).map((m) => ({
        // Keep last 6 messages for context
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    const response = await this.llm.invoke(messages);
    return response.content as string;
  }

  async analyzeConversation(state: ConversationState): Promise<{
    newPhase?: string;
    newMood?: string;
    performanceNote?: string;
    keyTopic?: string;
    objection?: string;
  }> {
    // Simple rule-based analysis for Phase 1
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

    return analysis;
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
