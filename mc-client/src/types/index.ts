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

export interface SessionState {
  sessionId: string;
  scenario: Scenario;
  phase: string;
  mood: string;
  keyTopics: string[];
}

export interface SessionSummary {
  sessionId: string;
  duration: number;
  messageCount: number;
  keyMoments: string[];
  strengths: string[];
  areasForImprovement: string[];
  overallFeedback: string;
}
