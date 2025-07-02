"use client";

import { useState } from "react";
import { generateTicket, postTicketToJira } from "../lib/jira-service";
import {
  Send,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";

interface TicketGeneratorProps {
  projectKey: string;
  accessToken: string;
  jiraBaseUrl: string;
  onTicketPosted?: () => void;
}

const StoryGenerator: React.FC<TicketGeneratorProps> = ({
  projectKey,
  accessToken,
  jiraBaseUrl,
  onTicketPosted,
}) => {
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [postingToJira, setPostingToJira] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [postedTicket, setPostedTicket] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<any>(null);
  const [textareaHeight, setTextareaHeight] = useState(44);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);

    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 200);
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTicket(null);
    setPostedTicket(null);
    setPostError(null);
    setIsEditing(false);
    setEditedTicket(null);

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
      setEditedTicket(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedTicket(ticket);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    setTicket(editedTicket);
    setIsEditing(false);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditedTicket((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLabelChange = (index: number, value: string) => {
    setEditedTicket((prev: any) => ({
      ...prev,
      labels: prev.labels.map((label: string, i: number) =>
        i === index ? value : label
      ),
    }));
  };

  const addLabel = () => {
    setEditedTicket((prev: any) => ({
      ...prev,
      labels: [...prev.labels, ""],
    }));
  };

  const removeLabel = (index: number) => {
    setEditedTicket((prev: any) => ({
      ...prev,
      labels: prev.labels.filter((_: string, i: number) => i !== index),
    }));
  };

  const handlePostToJira = async () => {
    const ticketToPost = isEditing ? editedTicket : ticket;
    if (!ticketToPost) return;

    setPostingToJira(true);
    setPostError(null);
    setPostedTicket(null);

    try {
      const result = await postTicketToJira(
        projectKey,
        ticketToPost.title,
        ticketToPost.description,
        ticketToPost.priority,
        "Task",
        ticketToPost.labels
      );
      setPostedTicket(result);
      if (onTicketPosted) {
        onTicketPosted();
      }
    } catch (err) {
      setPostError(
        err instanceof Error ? err.message : "Failed to post to Jira"
      );
    } finally {
      setPostingToJira(false);
    }
  };

  const getJiraIssueUrl = (issueKey: string) => {
    return `${jiraBaseUrl}/browse/${issueKey}`;
  };

  const priorityOptions = ["High", "Medium", "Low"];

  return (
    <div className="flex flex-col justify-center w-[850px] h-[calc(90vh-96px)] ">
      {!ticket && !loading && (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Stop Writing Start Automating{" "}
            <span className="gradient-background-2 bg-clip-text text-transparent">
              {" "}
              Your Tasks
            </span>
          </h1>
          <h2 className="text-base font-semibold mb-4 text-gray-200">
            Sprint is your AI companion for Jira, Notion, Monday.com, ClickUp,
            and Asana{" "}
          </h2>

          <h3 className="text-base text-gray-400">
            Create Task for {projectKey} project
          </h3>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="text-xl text-white">
              Generating your ticket...
            </span>
          </div>
          <p className="text-gray-400 text-center max-w-md">
            Our AI is analyzing your request and creating a detailed ticket for
            your project.
          </p>
        </div>
      )}

      <div className=" max-w-4xl p-4 bg-[var(--icon-black-primary)] overflow-y-auto max-h-[calc(100vh-200px)]">
        {ticket && (
          <div className="mt-6 p-4 rounded-md shadow-sm bg-[var(--icon-black-primary)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">
                {isEditing ? "Edit Ticket" : "Generated Ticket"}
              </h3>
              <Button
                onClick={handleEditToggle}
                size="sm"
                className="text-white"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>

            <div className="mb-4">
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editedTicket?.title || ""}
                    onChange={(e) => handleEditChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-[var(--icon-black-secondary)] text-white"
                  />
                </div>
              ) : (
                <h4 className="text-lg font-medium text-white">
                  {ticket.title}
                </h4>
              )}
            </div>

            <div className="mb-4">
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Priority
                  </label>
                  <select
                    value={editedTicket?.priority || "Medium"}
                    onChange={(e) =>
                      handleEditChange("priority", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-[var(--icon-black-secondary)] text-white"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-white">
                  Priority: {ticket.priority}
                </p>
              )}
            </div>

            <div className="mb-4 w-full">
              {isEditing ? (
                <div className="w-full">
                  <label className="block text-sm font-medium text-white mb-2">
                    Labels
                  </label>
                  <div className="space-y-2 w-full">
                    {editedTicket?.labels.map(
                      (label: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={label}
                            onChange={(e) =>
                              handleLabelChange(index, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-[var(--icon-black-secondary)] text-white"
                            placeholder="Enter label"
                          />
                          <Button
                            onClick={() => removeLabel(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      onClick={addLabel}
                      variant="outline"
                      size="sm"
                      className="text-custom-indigo"
                    >
                      Add Label
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ticket.labels.map((label: string) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={editedTicket?.description || ""}
                    onChange={(e) =>
                      handleEditChange("description", e.target.value)
                    }
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-[var(--icon-black-secondary)] text-white"
                    placeholder="Enter ticket description..."
                  />
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-white whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mb-6">
                <Button
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}

            {!isEditing && (
              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      Post to Jira Project
                    </h4>
                    <p className="text-xs text-white mt-1">
                      Create this ticket directly in your Jira project dashboard
                    </p>
                  </div>
                  <Button
                    onClick={handlePostToJira}
                    disabled={postingToJira || isEditing}
                    className="bg-none text-white"
                  >
                    {postingToJira ? (
                      "Posting..."
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2 text-white" />
                        Post to Jira
                      </>
                    )}
                  </Button>
                </div>

                {postedTicket && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          Ticket successfully posted to Jira!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Issue Key: {postedTicket.key}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={getJiraIssueUrl(postedTicket.key)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                          title="Open in Jira"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => {
                          setTicket(null);
                          setPostedTicket(null);
                          setPrompt("");
                          setContext("");
                          setIsEditing(false);
                          setEditedTicket(null);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-custom-indigo"
                      >
                        Create Another Ticket
                      </Button>
                      <Button
                        onClick={() => {
                          if (onTicketPosted) {
                            onTicketPosted();
                          }
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View All Issues
                      </Button>
                    </div>
                  </div>
                )}

                {postError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-sm text-red-800">{postError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-[var(--icon-black-primary)] p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div
                className={`relative flex flex-col rounded-3xl border border-white/10 backdrop-blur-xl bg-[var(--icon-black-secondary)] shadow-sm focus-within:border-white/20 focus-within:ring-white/20 px-2`}
                style={{ minHeight: "44px" }}
              >
                <div className="flex flex-col">
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={handleTextareaChange}
                    className="w-full bg-transparent resize-none text-sm focus:outline-none py-4 px-3 text-gray-400 border-none outline-none"
                    placeholder="Describe your task..."
                    required
                    rows={1}
                    style={{
                      minHeight: "60px",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  />
                </div>
                <div className="flex justify-between p-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 justify-center cursor-pointer px-1 py-2 rounded-md text-white bg-[var(--icon-black-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Add Context"
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Add Integration
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="inline-flex items-center justify-center cursor-pointer w-8 h-8 rounded-md text-white bg-[var(--icon-black-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
};

export default StoryGenerator;
