import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Building2,
  User,
  Users,
  Loader2,
  AlertCircle,
  Briefcase,
  Smile,
  Frown,
  Meh,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { scenariosApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getDifficultyStyles = (difficulty: string) => {
  const styles = {
    easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
    medium:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
    hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800",
  };
  return styles[difficulty as keyof typeof styles] || styles.medium;
};

const getMoodIcon = (mood: string) => {
  switch (mood) {
    case "interested":
      return <Smile className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case "skeptical":
      return <Meh className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    case "defensive":
      return (
        <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      );
    case "neutral":
      return <Meh className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    default:
      return <Frown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  }
};

export default function Scenarios() {
  const {
    data: scenarios,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.scenariosList(),
    queryFn: scenariosApi.getAll,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI-Powered Training
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Sales Role-Play Practice
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sharpen your sales skills with realistic AI conversations. Practice
            pitches, handle objections, and master discovery calls in a
            risk-free environment.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Loading scenarios...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-4 pt-6">
              <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">
                  Failed to load scenarios
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please check your connection and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {scenarios && scenarios.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No scenarios available
              </h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Check back soon for new practice scenarios
              </p>
            </CardContent>
          </Card>
        )}

        {/* Scenarios Grid */}
        <div className="grid gap-6">
          {scenarios?.map((scenario) => (
            <Card
              key={scenario.id}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                      {scenario.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {scenario.description}
                    </CardDescription>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${getDifficultyStyles(
                      scenario.difficulty
                    )}`}
                  >
                    {scenario.difficulty.toUpperCase()}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Prospect Info */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <User className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">
                        Prospect
                      </p>
                      <p className="text-sm font-semibold truncate">
                        {scenario.prospectName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {scenario.prospectRole}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">
                        Company
                      </p>
                      <p className="text-sm font-semibold truncate">
                        {scenario.company}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {scenario.industry}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Users className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">
                        Company Size
                      </p>
                      <p className="text-sm font-semibold">
                        {scenario.companySize}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0">
                      {getMoodIcon(scenario.initialMood)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">
                        Initial Mood
                      </p>
                      <p className="text-sm font-semibold capitalize">
                        {scenario.initialMood}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-4 bg-muted/20">
                <Link to={`/session/${scenario.id}`} className="w-full">
                  <Button className="w-full group/btn" size="lg">
                    Start Practice Session
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
