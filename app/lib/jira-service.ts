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

// Get the API Gateway URL from environment variables
const getApiGatewayUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  if (!url) {
    throw new Error("API Gateway URL not configured. Please set NEXT_PUBLIC_API_GATEWAY_URL environment variable.");
  }
  return url;
};

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
    const apiGatewayUrl = getApiGatewayUrl();
    
    const response = await fetch(`${apiGatewayUrl}/generate-ticket`, {
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
    youtubeUrls,
    undefined
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
