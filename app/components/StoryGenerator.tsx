"use client";

import { useState } from "react";
import { generateTicket } from "../lib/jira-service";

interface TicketGeneratorProps {
  projectKey: string;
  accessToken: string;
  jiraBaseUrl: string;
}

const TicketGenerator: React.FC<TicketGeneratorProps> = ({
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
    <>
      <div className="max-w-2xl mx-auto p-4">

      {ticket && (
        <div className="mt-6 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Priority: {ticket.priority}</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700"
            >
              What would you like to create a ticket for?
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label
              htmlFor="context"
              className="block text-sm font-medium text-gray-700"
            >
              Additional Context (optional)
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
              placeholder="Enter additional context, one item per line"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Ticket"}
          </button>
        </form>
      </div>
    </>
  );
};

export default TicketGenerator;
