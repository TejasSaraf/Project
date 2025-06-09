import Hero from "./Hero";
import Features from "./Features";
import ProblemSolution from "./ProblemSolution";
import CTA from "./CTA";
import Footer from "./Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <ProblemSolution />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
