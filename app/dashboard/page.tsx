"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, ExternalLink, Plus } from "lucide-react";
import TicketGenerator from "app/components/TicketGenerator";

interface JiraProject {
  id: string;
  key: string;
  name: string;
  jiraBaseUrl: string;
  accessToken: string;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    status: {
      name: string;
    };
    assignee: {
      displayName: string;
    } | null;
    priority: {
      name: string;
    };
  };
}

const ProjectCard = ({
  project,
  onViewIssues,
  onCreateTask,
}: {
  project: JiraProject;
  onViewIssues: (project: JiraProject) => void;
  onCreateTask: (project: JiraProject) => void;
}) => (
  <Card className="p-4">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
        <p className="text-sm text-gray-600">Key: {project.key}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewIssues(project)}
        >
          View Issues
        </Button>
        <Button size="sm" onClick={() => onCreateTask(project)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>
    </div>
  </Card>
);

const IssueCard = ({
  issue,
  jiraBaseUrl,
}: {
  issue: JiraIssue;
  jiraBaseUrl: string;
}) => (
  <Card key={issue.id} className="p-4">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {issue.key}: {issue.fields.summary}
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Status: {issue.fields.status.name}
          </p>
          <p className="text-sm text-gray-600">
            Priority: {issue.fields.priority.name}
          </p>
          {issue.fields.assignee && (
            <p className="text-sm text-gray-600">
              Assignee: {issue.fields.assignee.displayName}
            </p>
          )}
        </div>
      </div>
      <a
        href={`${jiraBaseUrl}/browse/${issue.key}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800"
      >
        <ExternalLink className="w-5 h-5" />
      </a>
    </div>
  </Card>
);

const ErrorMessage = ({
  message,
  showConnectButton = true,
}: {
  message: string;
  showConnectButton?: boolean;
}) => (
  <div className="text-center py-8">
    <p className="text-lg mb-4 text-red-600">{message}</p>
    {showConnectButton && (
      <Link href="/api/jira/connect">
        <Button>Connect Jira</Button>
      </Link>
    )}
  </div>
);

export default function DashboardPage() {
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(
    null
  );
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
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
          if (
            response.status === 400 &&
            data.message === "Jira not integrated for this user."
          ) {
            setError("Please connect your Jira account to get started.");
          } else {
            setError(data.message || "Failed to fetch Jira projects.");
          }
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

  const handleProjectClick = async (project: JiraProject) => {
    setSelectedProject(project);
    setLoadingIssues(true);
    setIssues([]);

    try {
      const response = await fetch(
        `/api/jira/issues?projectKey=${project.key}`
      );
      const data = await response.json();

      if (response.ok) {
        setIssues(data.issues || []);
      } else {
        setError(data.message || "Failed to fetch issues.");
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("An unexpected error occurred while fetching issues.");
    } finally {
      setLoadingIssues(false);
    }
  };

  const handleBackClick = () => {
    setSelectedProject(null);
    setIssues([]);
  };

  const handleCreateTask = (project: JiraProject) => {
    setSelectedProject(project);
    setIsCreatingTask(true);
  };

  const renderProjectsList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onViewIssues={handleProjectClick}
          onCreateTask={handleCreateTask}
        />
      ))}
    </div>
  );

  const renderIssuesList = () => (
    <div>
      <Button variant="ghost" className="mb-4" onClick={handleBackClick}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Button>

      <h2 className="text-2xl font-semibold mb-4">
        Issues for {selectedProject?.name}
      </h2>

      {loadingIssues ? (
        <p className="text-lg">Loading issues...</p>
      ) : issues.length === 0 ? (
        <p className="text-lg">No issues found for this project.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              jiraBaseUrl={selectedProject!.jiraBaseUrl}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateTask = () => (
    <div>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => {
          setIsCreatingTask(false);
          setSelectedProject(null);
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Button>

      <h2 className="text-2xl font-semibold mb-4">
        Create Task for {selectedProject?.name}
      </h2>
      <TicketGenerator
        projectKey={selectedProject!.key}
        accessToken={selectedProject!.accessToken}
        jiraBaseUrl={selectedProject!.jiraBaseUrl}
      />
    </div>
  );

  return (
    <div className="container mx-auto p-4">
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

      {loading && <p className="text-lg">Loading Jira projects...</p>}

      {!loading && projects.length === 0 && !error && (
        <ErrorMessage message="No Jira projects found." />
      )}

      {!loading && error && <ErrorMessage message={error} />}

      {!loading &&
        projects.length > 0 &&
        !selectedProject &&
        renderProjectsList()}
      {selectedProject && !isCreatingTask && renderIssuesList()}
      {selectedProject && isCreatingTask && renderCreateTask()}
    </div>
  );
}
