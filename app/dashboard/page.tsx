"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const urlError = searchParams.get("error");
  const urlSuccess = searchParams.get("success");

  useEffect(() => {
    async function fetchJiraProjects() {
      try {
        const response = await fetch("/api/jira/projects");
        const data = await response.json();

        if (response.ok) {
          setProjects(data.values || []);
          setError(null);
        } else {
          setError(data.message || "Failed to fetch Jira projects.");
          setProjects([]);
        }
      } catch (err) {
        console.error("Frontend error fetching Jira projects:", err);
        setError("An unexpected error occurred. Please try again.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJiraProjects();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      {urlSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline">
            {" "}
            {decodeURIComponent(urlSuccess)}
          </span>
        </div>
      )}

      {urlError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">
            {" "}
            {decodeURIComponent(urlError)}
          </span>
          <Link
            href="/api/jira/connect"
            className="text-blue-600 hover:underline ml-2"
          >
            Try Again
          </Link>
        </div>
      )}

      {loading && <p className="text-lg">Loading Jira projects...</p>}

      {error && !urlError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          {error.includes("reconnect Jira") && (
            <Link
              href="/api/jira/connect"
              className="text-blue-600 hover:underline ml-2"
            >
              Reconnect Jira
            </Link>
          )}
        </div>
      )}

      {!loading && projects.length === 0 && !urlError && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
          <p className="text-lg">
            You haven't integrated Jira yet or no projects are accessible.
          </p>
          <Link
            href="/api/jira/connect"
            className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Connect Jira Account
          </Link>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Jira Projects:</h2>
          <ul className="list-disc pl-5">
            {projects.map((project) => (
              <li key={project.id} className="mb-2">
                <strong>{project.name}</strong> ({project.key})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
