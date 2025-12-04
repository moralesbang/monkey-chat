import axios from "axios";
import type {
  ConversationState,
  ResponseMessage,
  Scenario,
  SessionSummary,
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const scenariosApi = {
  getAll: async (): Promise<Scenario[]> => {
    const response = await api.get("/scenarios");
    return response.data;
  },

  getById: async (id: string): Promise<Scenario> => {
    const response = await api.get(`/scenarios/${id}`);
    return response.data;
  },
};

export const sessionsApi = {
  start: async (scenarioId: string) => {
    const response = await api.post("/sessions/start", { scenarioId });
    return response.data;
  },

  sendMessage: async (
    sessionId: string,
    message: string
  ): Promise<ResponseMessage> => {
    const response = await api.post(`/sessions/${sessionId}/message`, {
      message,
    });
    return response.data;
  },

  end: async (sessionId: string): Promise<SessionSummary> => {
    const response = await api.post(`/sessions/${sessionId}/end`);
    return response.data;
  },

  get: async (sessionId: string): Promise<ConversationState> => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },
};
