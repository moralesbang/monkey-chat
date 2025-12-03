import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Session() {
  const { scenarioId } = useParams<{ scenarioId: string }>();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Scenarios
            </Link>
            <h1 className="text-2xl font-bold mt-2">Practice Session</h1>
            <p className="text-sm text-muted-foreground">Scenario ID: {scenarioId}</p>
          </div>
          <Button variant="destructive" size="sm">End Session</Button>
        </div>
      </div>

      {/* Chat Area - Placeholder */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4">
        <div className="h-full border rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Chat Interface Coming Soon</h2>
            <p className="text-muted-foreground">
              This is where the conversation with the AI prospect will happen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
