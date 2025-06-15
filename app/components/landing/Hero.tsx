import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black from-background via-cyan-50 to-cyan-100 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-black backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              AI-Powered JIRA Automation
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Stop Writing
            <span className="third-graidient-text bg-clip-text text-transparent">
              {" "}
              JIRA Tickets
            </span>
            <br />
            Start Speaking Them
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your natural language into perfectly structured JIRA
            tickets instantly. Connect your workspace, describe your task, and
            watch AI create detailed tickets ready for your sprint.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border text-foreground hover:bg-accent px-8 py-3 text-lg font-semibold"
            >
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>2-minute setup</span>
            </div>
            <span>•</span>
            <span>No credit card required</span>
            <span>•</span>
            <span>Free 14-day trial</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
