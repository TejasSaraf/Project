"use client";

import { useState } from "react";
import { generateTicket } from "../lib/jira-service";
import { Send } from "lucide-react";

interface TicketGeneratorProps {
  projectKey: string;
  accessToken: string;
  jiraBaseUrl: string;
}

const StoryGenerator: React.FC<TicketGeneratorProps> = ({
  projectKey,
  accessToken,
  jiraBaseUrl,
}) => {
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTicket(null);

    try {
      const contextArray = context
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const result = await generateTicket(
        prompt,
        contextArray,
        projectKey,
        accessToken,
        jiraBaseUrl
      );
      setTicket(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                What would you like to create a ticket for?
              </label>
              <div className="relative flex items-center justify-end rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 px-2">
                <input
                  type="text"
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-transparent py-3 pl-4 pr-12 text-sm focus:outline-none px-2"
                  placeholder="Describe your task..."
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="inline-flex items-center justify-center cursor-pointer w-8 h-8 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Generate Ticket"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="flex-grow max-w-2xl mx-auto p-4">
        {ticket && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">
              {ticket.title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Priority: {ticket.priority}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ticket.labels.map((label: string) => (
                  <span
                    key={label}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Description</h4>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryGenerator;
