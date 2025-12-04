import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  User,
  Loader2,
  Send,
  AlertCircle,
  Sparkles,
  MessageSquare,
  XCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Star,
  Lightbulb,
  Target,
  Award,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scenariosApi, sessionsApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Message, ResponseMessage, SessionSummary } from "@/types";

export default function Session() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch scenario details
  const {
    data: scenario,
    isLoading: isLoadingScenario,
    error: scenarioError,
  } = useQuery({
    queryKey: queryKeys.scenarioDetail(scenarioId!),
    queryFn: () => scenariosApi.getById(scenarioId!),
    enabled: !!scenarioId,
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: () => sessionsApi.start(scenarioId!),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      if (data.messages) {
        setMessages(data.messages);
      }
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) =>
      sessionsApi.sendMessage(sessionId!, message),
    onSuccess: (response: ResponseMessage) => {
      // Convert single ResponseMessage to Message
      const aiMessage: Message = {
        role: "assistant" as const,
        content: response.prospectResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: () => sessionsApi.end(sessionId!),
    onSuccess: (data: SessionSummary) => {
      setSummary(data);
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-start session when scenario loads
  useEffect(() => {
    if (scenario && !sessionId && !startSessionMutation.isPending) {
      startSessionMutation.mutate();
    }
  }, [scenario, sessionId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId || sendMessageMutation.isPending)
      return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleEndSession = () => {
    if (sessionId) {
      endSessionMutation.mutate();
    } else {
      navigate("/");
    }
  };

  if (isLoadingScenario || startSessionMutation.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            {isLoadingScenario
              ? "Loading scenario..."
              : "Starting practice session..."}
          </p>
        </div>
      </div>
    );
  }

  if (scenarioError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="border-destructive/50 bg-destructive/5 max-w-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">
                Failed to load scenario
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This scenario could not be found.
              </p>
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Scenarios
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session Summary View
  if (summary) {
    const durationMinutes = Math.floor(summary.duration / 60);
    const durationSeconds = summary.duration % 60;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-green-500/10 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Session Completed
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Great Work!
            </h1>
            <p className="text-lg text-muted-foreground">
              Here's how you performed in your practice session
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="p-3 rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Duration
                  </p>
                  <p className="text-2xl font-bold">
                    {durationMinutes}:
                    {durationSeconds.toString().padStart(2, "0")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="p-3 rounded-full bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Messages
                  </p>
                  <p className="text-2xl font-bold">{summary.messageCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Feedback */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle>Overall Feedback</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {summary.overallFeedback}
              </p>
            </CardContent>
          </Card>

          {/* Strengths */}
          {summary.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <CardTitle>Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Areas for Improvement */}
          {summary.areasForImprovement.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <CardTitle>Areas for Improvement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Key Moments */}
          {summary.keyMoments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Key Moments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.keyMoments.map((moment, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{moment}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={() => navigate("/")} className="flex-1" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Back to Scenarios
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Practice Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Scenarios
              </Link>
              <h1 className="text-2xl font-bold mb-1 truncate">
                {scenario?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* Session Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    sessionId
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      sessionId
                        ? "bg-green-600 dark:bg-green-400 animate-pulse"
                        : "bg-amber-600 dark:bg-amber-400"
                    }`}
                  />
                  {sessionId ? "Active" : "Initializing"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    {scenario?.prospectName} - {scenario?.prospectRole}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{scenario?.company}</span>
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndSession}
              disabled={!sessionId || endSessionMutation.isPending}
            >
              {endSessionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 && !sendMessageMutation.isPending && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Start the conversation
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Introduce yourself and begin your practice session with{" "}
                  {scenario?.prospectName}
                </p>
              </CardContent>
            </Card>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.role === "assistant"
                    ? "bg-muted"
                    : "bg-accent/50 text-accent-foreground"
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {message.role === "assistant" && (
                    <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                  )}
                  <span className="text-xs font-medium opacity-70">
                    {message.role === "user"
                      ? "You"
                      : message.role === "assistant"
                      ? scenario?.prospectName
                      : "System"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 bg-muted">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {scenario?.prospectName} is typing...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="border-2">
          <CardContent className="p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={!sessionId || sendMessageMutation.isPending}
                className="flex-1"
                autoFocus
              />
              <Button
                type="submit"
                disabled={
                  !inputMessage.trim() ||
                  !sessionId ||
                  sendMessageMutation.isPending
                }
                size="lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
