export interface Scenario {
  id: string;
  title: string;
  description: string;
  prospectRole: string;
  prospectName: string;
  company: string;
  industry: string;
  companySize: string;
  background: string;
  painPoints: string[];
  initialMood: "skeptical" | "neutral" | "interested" | "defensive";
  difficulty: "easy" | "medium" | "hard";
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface ConversationState {
  sessionId: string;
  scenario: Scenario;
  messages: Message[];
  phase: "opening" | "discovery" | "objection_handling" | "closing" | "ended";
  prospectMood: string;
  keyTopicsDiscussed: string[];
  objectionsRaised: string[];
  performanceNotes: string[];
  startedAt: Date;
  endedAt?: Date;
}

export interface SessionSummary {
  sessionId: string;
  duration: number; // in seconds
  messageCount: number;
  keyMoments: string[];
  strengths: string[];
  areasForImprovement: string[];
  overallFeedback: string;
}
