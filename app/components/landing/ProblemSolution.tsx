import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

const ProblemSolution = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-full px-4 py-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                The Current Problem
              </span>
            </div>

            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Creating JIRA tickets shouldn't be a{" "}
              <span className="text-destructive">time sink</span>
            </h2>

            <div className="space-y-6">
              {[
                "Spending 10+ minutes formatting each ticket properly",
                "Forgetting crucial details and acceptance criteria",
                "Inconsistent ticket quality across team members",
                "Context switching between thinking and documentation",
              ].map((problem, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-muted-foreground text-lg">{problem}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Our Solution
              </span>
            </div>

            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Describe it naturally, get perfect{" "}
              <span className="text-primary">tickets instantly</span>
            </h2>

            <div className="space-y-6">
              {[
                "AI understands context and generates comprehensive tickets",
                "Consistent formatting and structure every time",
                "Automatically suggests acceptance criteria and edge cases",
                "One-click posting directly to your JIRA workspace",
              ].map((solution, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-muted-foreground text-lg">{solution}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="font-semibold text-foreground">
                  Live Example
                </span>
              </div>
              <p className="text-muted-foreground italic mb-2">
                "Add a dark mode toggle to the user settings page"
              </p>
              <ArrowRight className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-card-foreground mb-2">
                  Feature: Dark Mode Toggle
                </h4>
                <p className="text-sm text-muted-foreground">
                  Complete JIRA ticket with description, acceptance criteria,
                  story points, and labels automatically generated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
