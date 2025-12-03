import { Button } from "@/components/ui/button";

export default function Scenarios() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Sales Role-Play Practice</h1>
        <p className="text-muted-foreground mb-8">
          Choose a scenario to practice your sales conversation with an AI-powered prospect
        </p>

        <div className="grid gap-4">
          {/* Placeholder for scenarios - will implement later */}
          <div className="border rounded-lg p-6 hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-2">Scenarios coming soon...</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Practice scenarios will be listed here
            </p>
            <Button disabled>Start Practice</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
