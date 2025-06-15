interface TicketRequest {
  prompt: string;
  context?: string[];
  project_key?: string;
  access_token: string;
  jira_base_url: string;
}

interface TicketResponse {
  title: string;
  description: string;
  priority: string;
  labels: string[];
}

export async function generateTicket(
  prompt: string,
  context: string[] = [],
  projectKey?: string,
  accessToken?: string,
  jiraBaseUrl?: string
): Promise<TicketResponse> {
  const response = await fetch("/api/jiraserviceconnection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      context,
      project_key: projectKey,
      access_token: accessToken,
      jira_base_url: jiraBaseUrl,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate ticket");
  }

  const data = await response.json();
  return data as TicketResponse;
}
