import type { Scenario } from "../types";

export const scenarios: Scenario[] = [
  {
    id: "cold-call-vp-eng",
    title: "Cold Call to VP of Engineering",
    description:
      "Reach out to a VP of Engineering at a mid-size SaaS company about your DevOps automation tool.",
    prospectRole: "VP of Engineering",
    prospectName: "Sarah Chen",
    company: "TechFlow Solutions",
    industry: "B2B SaaS",
    companySize: "150-200 employees",
    background:
      "Sarah has been with TechFlow for 3 years. The engineering team is growing rapidly and struggling with deployment bottlenecks. They currently use a mix of Jenkins and manual processes.",
    painPoints: [
      "Slow deployment cycles (3-4 days)",
      "Manual testing processes",
      "Lack of visibility into deployment status",
      "Team spending too much time on DevOps instead of features",
    ],
    initialMood: "skeptical",
    difficulty: "hard",
  },
  {
    id: "discovery-cfo",
    title: "Discovery Call with CFO",
    description:
      "Conduct a discovery call with a CFO who is evaluating financial planning software.",
    prospectRole: "Chief Financial Officer",
    prospectName: "Michael Torres",
    company: "GrowthMetrics Inc",
    industry: "Financial Services",
    companySize: "50-75 employees",
    background:
      "Michael is looking to replace their current Excel-based financial planning process. Budget is approved but he's evaluating multiple vendors.",
    painPoints: [
      "Time-consuming manual consolidation",
      "Lack of real-time visibility",
      "Version control issues",
      "Difficulty creating what-if scenarios",
    ],
    initialMood: "neutral",
    difficulty: "medium",
  },
  {
    id: "demo-hr-director",
    title: "Product Demo with HR Director",
    description:
      "Present your HR analytics platform to an HR Director who has already seen a demo.",
    prospectRole: "HR Director",
    prospectName: "Lisa Patel",
    company: "Innovate Corp",
    industry: "Technology",
    companySize: "300-500 employees",
    background:
      "Lisa attended your webinar last month and requested a personalized demo. She's currently using Workday but frustrated with limited analytics.",
    painPoints: [
      "Can't easily track DEI metrics",
      "Limited customization in reports",
      "Poor integration with existing tools",
      "High costs for additional modules",
    ],
    initialMood: "interested",
    difficulty: "easy",
  },
];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((item) => item.id === id);
}
