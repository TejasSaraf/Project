import React from "react";
import { Card } from "../components/ui/card";

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
    created: string;
  };
}

interface IssueCardProps {
  issue: JiraIssue;
  jiraBaseUrl: string;
}

export default function IssueCard({
  issue,
  jiraBaseUrl,
}: IssueCardProps): React.ReactElement {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .replace(",", "");
  };

  const getStatusStyle = (status: string) => {
    const statusLower = status.toLowerCase().trim();

    switch (statusLower) {
      case "to do":
      case "todo":
      case "backlog":
        return {
          backgroundColor: "#e0e7ff",
          color: "#3730a3",
        };
      case "in progress":
      case "inprogress":
      case "progress":
        return {
          backgroundColor: "#fef3c7",
          color: "#92400e",
        };
      case "launched":
      case "released":
        return {
          backgroundColor: "#e5e7eb",
          color: "#374151",
        };
      case "done":
      case "complete":
      case "completed":
      case "closed":
        return {
          backgroundColor: "#d1fae5",
          color: "#065f46",
        };
      default:
        return {
          backgroundColor: "#e5e7eb",
          color: "#374151",
        };
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold">
              {issue.key}: {issue.fields.summary}
            </h3>
          </div>
          <div className="space-y-1">
            <p
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4"
              style={getStatusStyle(issue.fields.status.name)}
            >
              {issue.fields.status.name}
            </p>
            <div className="flex justify-between">
              <p className="text-xs text-gray-600 mb-4">
                {issue.fields.assignee
                  ? issue.fields.assignee.displayName
                  : "Unassigned"}
              </p>
              <p className="text-xs text-gray-600 mb-4">
                {formatDate(issue.fields.created)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
