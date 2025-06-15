import React from "react";
import { Card } from "../components/ui/card";
import { Plus } from "lucide-react";

interface JiraProject {
  id: string;
  key: string;
  name: string;
  jiraBaseUrl: string;
  accessToken: string;
  issueCount?: number;
}

interface ProjectCardProps {
  project: JiraProject;
  onViewIssues: (project: JiraProject) => void;
  onCreateTask: (project: JiraProject) => void;
}

export default function ProjectCard({
  project,
  onViewIssues,
  onCreateTask,
}: ProjectCardProps): React.ReactElement {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewIssues(project)}
    >
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold">{project.name}</h3>
            <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              issues: {project.issueCount || 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 mb-4">Key: {project.key}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full cursor-pointer bg-transparnt text-icon-blue-secondary">
          <button
            className="w-[58%] flex items-center cursor-pointer text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onCreateTask(project);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </button>
        </div>
      </div>
    </Card>
  );
}
