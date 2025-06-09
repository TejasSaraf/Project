import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg"></div>
              <span className="text-xl font-bold">Flick</span>
            </div>
            <p className="text-background/70 mb-6">
              Transform your natural language into perfectly structured JIRA
              tickets instantly.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-background/70 hover:text-background transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-background/70 hover:text-background transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-background/70 hover:text-background transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-background/70 hover:text-background transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Integrations
              </a>
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                API
              </a>
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Pricing
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Blog
              </a>
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Careers
              </a>
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Help Center
              </a>
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Documentation
              </a>
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Status
              </a>
              <a
                href="#"
                className="block text-background/70 hover:text-background transition-colors"
              >
                Security
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/70 text-sm">
            © 2025 Flick. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-background/70 mt-4 md:mt-0">
            <a href="#" className="hover:text-background transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-background transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-background transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
