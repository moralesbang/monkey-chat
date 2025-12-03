export const queryKeys = {
  // Scenarios
  scenarios: ["scenarios"] as const,
  scenariosList: () => [...queryKeys.scenarios, "list"] as const,
  scenarioDetail: (id: string) =>
    [...queryKeys.scenarios, "detail", id] as const,

  // Sessions
  sessions: ["sessions"] as const,
  sessionDetail: (id: string) => [...queryKeys.sessions, "detail", id] as const,
  sessionMessages: (id: string) =>
    [...queryKeys.sessions, id, "messages"] as const,
} as const;
