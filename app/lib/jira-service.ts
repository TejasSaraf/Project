interface TicketResponse {
  ticket_id: string;
  title: string;
  description: string;
  priority: string;
  labels: string[];
}

export class JiraServiceError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "JiraServiceError";
  }
}

export async function generateTicket(
  prompt: string,
  context: string[] = [],
  projectKey?: string,
  accessToken?: string,
  jiraBaseUrl?: string,
  youtubeUrls?: string[],
  webUrls?: string[]
): Promise<TicketResponse> {
  try {
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
        youtube_urls: youtubeUrls,
        web_urls: webUrls,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new JiraServiceError(
        errorData.error || "Failed to generate ticket",
        response.status
      );
    }

    const data = await response.json();
    return data as TicketResponse;
  } catch (error) {
    if (error instanceof JiraServiceError) {
      throw error;
    }
    throw new JiraServiceError(
      error instanceof Error ? error.message : "Failed to generate ticket"
    );
  }
}

// Helper function for generating tickets with YouTube context
export async function generateTicketWithYouTube(
  prompt: string,
  youtubeUrls: string[],
  projectKey?: string,
  accessToken?: string,
  jiraBaseUrl?: string
): Promise<TicketResponse> {
  return generateTicket(
    prompt,
    [],
    projectKey,
    accessToken,
    jiraBaseUrl,
    youtubeUrls
  );
}

// Helper function for generating tickets with web context
export async function generateTicketWithWeb(
  prompt: string,
  webUrls: string[],
  projectKey?: string,
  accessToken?: string,
  jiraBaseUrl?: string
): Promise<TicketResponse> {
  return generateTicket(
    prompt,
    [],
    projectKey,
    accessToken,
    jiraBaseUrl,
    undefined,
    webUrls
  );
}

// Helper function for generating tickets with both YouTube and web context
export async function generateTicketWithRichContext(
  prompt: string,
  youtubeUrls: string[],
  webUrls: string[],
  projectKey?: string,
  accessToken?: string,
  jiraBaseUrl?: string
): Promise<TicketResponse> {
  return generateTicket(
    prompt,
    [],
    projectKey,
    accessToken,
    jiraBaseUrl,
    youtubeUrls,
    webUrls
  );
}
