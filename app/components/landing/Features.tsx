import { Bot, Zap, Shield, Users, BarChart3, Settings } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Generation",
      description:
        "Advanced AI understands context and generates comprehensive JIRA tickets with proper formatting, acceptance criteria, and story points.",
    },
    {
      icon: Zap,
      title: "Instant Integration",
      description:
        "Connect your JIRA workspace in seconds. No complex setup or configuration required - just authenticate and start creating.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Enterprise-grade security with SOC 2 compliance. Your data never leaves your control and is encrypted end-to-end.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Share ticket templates, maintain consistency across team members, and ensure everyone follows the same standards.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description:
        "Track time saved, ticket quality metrics, and team productivity improvements with detailed analytics dashboard.",
    },
    {
      icon: Settings,
      title: "Custom Templates",
      description:
        "Create custom ticket templates for different project types, ensuring consistency and saving even more time.",
    },
  ];

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need to{" "}
            <span className="text-white">streamline</span> your workflow
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Powerful features designed to save time, improve consistency, and
            enhance your team's productivity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-border"
            >
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
